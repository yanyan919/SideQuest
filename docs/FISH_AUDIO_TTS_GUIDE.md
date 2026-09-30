# Fish Audio TTS 可复用笔记（SideQuest）

这份笔记总结 SideQuest 当前已验证过的 Fish Audio 接入方式，方便以后给其他浏览器端插件添加 TTS。它记录的是本项目的实现，不替代 Fish Audio 官方 API 文档。

## 1. 请求流程

1. 前端准备要朗读的纯文本，清除控制字符并合并多余空白。
2. 请求通过 SillyTavern 同源代理转发：`/proxy/https://api.fish.audio/v1/tts`。
3. 使用 `POST`、`Authorization: Bearer <API_KEY>`、`Content-Type: application/json`，并在 `model` 请求头指定模型。
4. JSON 请求体至少包含 `{ "text": "...", "format": "mp3" }`；设置了参考音色时，再加 `reference_id`。
5. 先检查 `response.ok`。非 2xx 响应要作为接口错误处理，不能把错误响应当作音频播放。
6. 读取 Blob，检查是否为空，再检查 Content-Type 和文件头。
7. 创建 `audio/mpeg` Blob / Object URL，交给 Audio 播放；播放失败时单独捕获 `NotSupportedError`、`NotAllowedError` 等错误。

## 2. 可复用的请求核心

```js
async function requestFishMp3(text, apiKey, model = 's2.1-pro-free', referenceId = '') {
    const body = { text, format: 'mp3' };
    if (referenceId.trim()) body.reference_id = referenceId.trim();

    // 在 SillyTavern 扩展中使用同源代理；普通网站需根据自己的后端架构调整。
    const response = await fetch('/proxy/https://api.fish.audio/v1/tts', {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + apiKey,
            'Content-Type': 'application/json',
            model,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const detail = (await response.text().catch(() => '')).slice(0, 180);
        throw new Error('Fish Audio HTTP ' + response.status + (detail ? ': ' + detail : ''));
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    const blob = await response.blob();
    if (!blob.size) throw new Error('Fish Audio returned an empty body.');

    const bytes = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
    const hasId3 = bytes.length >= 3 &&
        bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33;
    const hasMpegFrame = bytes.length >= 2 &&
        bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0;
    const looksLikeMp3 = hasId3 || hasMpegFrame;

    // If the server explicitly declares JSON/HTML/text, do not mislabel it as audio.
    const declaredNonAudio = contentType.includes('json') ||
        contentType.includes('text/html') || contentType.startsWith('text/');
    if (declaredNonAudio ||
        (!contentType.startsWith('audio/') &&
         !contentType.includes('octet-stream') && !looksLikeMp3)) {
        throw new Error('Fish Audio response does not look like playable audio.');
    }

    // Some proxy paths omit Content-Type even though the body is MP3.
    return looksLikeMp3 && !contentType.startsWith('audio/')
        ? new Blob([await blob.arrayBuffer()], { type: 'audio/mpeg' })
        : blob;
}
```

## 3. 播放与 iPhone Safari

```js
const blob = await requestFishMp3(text, apiKey);
const url = URL.createObjectURL(blob);
const audio = new Audio(url);
audio.preload = 'auto';

try {
    // For iOS Safari, start this from a direct user action when possible.
    await audio.play();
} catch (error) {
    // NotAllowedError: browser autoplay/user-gesture policy may have blocked playback.
    // NotSupportedError: body/codec/MIME may not be supported or may not be valid audio.
    throw error;
} finally {
    // Revoke the URL only when you no longer need to replay this audio.
    // If the UI has a replay button, keep the URL alive while the cache entry is retained.
}
```

## 4. 为什么要检查 HTTP 状态和音频文件头

- HTTP 500 表示服务器/代理请求失败；响应体可能是错误 JSON、HTML、文本或其他内容，不一定是音频。
- `����` 通常只是二进制字节被当作文本解码后的显示结果，不能据此判断它是 MP3。
- `Content-Type` 可能缺失或被代理改写，因此可以在类型不明确时检查 MP3 文件头。
- 文件头检查只是初步识别，不保证整个文件完整，也不能修复无效或损坏的音频。
- 不要把任何未知响应一律强行标记为 `audio/mpeg`；先检查状态、类型和字节，再决定是否播放。

## 5. SillyTavern 代理与安全

SideQuest 的浏览器代码请求同源路径 `/proxy/https://api.fish.audio/v1/tts`，由 ST 代理配置处理上游请求。具体是否可用取决于 ST 版本与代理配置。只在确实需要时启用代理，并理解代理可能扩大服务器可访问的目标范围；不要把代理开放给不可信用户。

不要把 API Key 写死在公开源码里，也不要把密钥提交到 GitHub。SideQuest 当前把密钥放在当前浏览器的 localStorage 中，方便使用但不属于加密保险库。

## 6. 缓存建议

相同的文本、提供商、API 地址、模型和参考音色/voice 应命中同一缓存键。缓存音频 Blob，而不是只缓存临时 Object URL，因为 Object URL 在刷新页面后不能继续使用。

SideQuest 当前采用两层缓存：
- 内存 Map：当前页面会话内快速重播。
- IndexedDB：保存音频 Blob，刷新页面后仍可复用；最多 40 项、总量约 20 MiB，超限时淘汰较早的条目。

缓存按浏览器来源隔离。iPhone 和 Android 即使打开同一个 ST 地址，通常也有各自独立的浏览器存储，因此不会自动共享音频缓存。系统语音由浏览器合成，不经过 Fish/MiMo API，也不需要缓存接口音频。
