# ZXingBlazor

[English](README.md) · [在线体验](https://densen2014.github.io/ZXingBlazor/) · [NuGet](https://www.nuget.org/packages/ZXingBlazor/) · [GitHub](https://github.com/densen2014/ZXingBlazor)

ZXingBlazor 是适用于 Blazor 的摄像头扫码组件，支持 Blazor WebAssembly、Blazor Server，以及 .NET 6 至 .NET 10。

## 主要功能

- 识别 QR Code、Data Matrix、PDF417 和常见一维码。
- 调用手机或桌面摄像头，支持设备选择和保存上次使用的设备。
- 支持单次解码和连续解码。
- 使用同一摄像头流识别普通条码和黑底白码等反色条码。
- 扫码成功时捕获当前视频画面。
- 可直接使用内置扫码界面，也可通过 `data-action` 自定义界面。
- 通过 `BarCodes` 组件从图片解码条码并生成二维码。
- 使用 JavaScript 隔离，无需在页面中手动添加脚本。

## 在线示例

.NET 10 WebAssembly 示例已经部署到 GitHub Pages：

**https://densen2014.github.io/ZXingBlazor/**

页面源码：[`Demo.Wasm/Pages/Index.razor`](Demo.Wasm/Pages/Index.razor)

GitHub Pages 只能托管静态文件，因此线上示例使用独立 Blazor WebAssembly。Blazor Interactive Auto 首次交互需要 ASP.NET Core 服务端，不能作为纯静态 Pages 站点运行。

## 快速上手

### 1. 安装 NuGet 包

```bash
dotnet add package ZXingBlazor
```

### 2. 导入命名空间

在 `_Imports.razor` 或使用扫码器的 Razor 组件中添加：

```razor
@using ZXingBlazor.Components
```

### 3. 添加扫码组件

```razor
<button class="btn btn-primary" @onclick="(() => scannerVisible = true)">
    扫码
</button>

@if (scannerVisible)
{
    <BarcodeReader ScanResult="OnScanResult"
                   Close="(() => scannerVisible = false)"
                   OnError="OnError" />
}

@if (!string.IsNullOrWhiteSpace(result))
{
    <p>扫码结果：@result</p>
}

@code {
    private bool scannerVisible;
    private string? result;
    private string? error;

    private void OnScanResult(string text)
    {
        result = text;
        scannerVisible = false;
    }

    private Task OnError(string message)
    {
        error = message;
        return Task.CompletedTask;
    }
}
```

生产环境必须使用 HTTPS 才能访问摄像头；本地开发可使用 `localhost`。

## 获取扫码截图

启用 `CaptureStillOnScan` 并处理 `ScanCaptured`，即可同时取得扫码文本和 JPEG Data URL：

```razor
<BarcodeReader ScanResult="OnScanResult"
               ScanCaptured="OnScanCaptured"
               CaptureStillOnScan="true"
               CaptureStillAutoResumeDelay="3000" />

@code {
    private string? imageDataUrl;

    private void OnScanResult(string text)
    {
    }

    private void OnScanCaptured(ScanCapturedEventArgs args)
    {
        imageDataUrl = args.ImageDataUrl;
    }
}
```

图片使用流式 JavaScript 互操作传输，可避免 Blazor Server 默认消息大小对大图片的限制。

## 主要参数与回调

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `ScanResult` | `EventCallback<string>` | 返回解码后的文本。 |
| `ScanCaptured` | `EventCallback<ScanCapturedEventArgs>` | 返回解码文本和捕获的 JPEG Data URL。 |
| `Close` | `EventCallback` | 扫码界面关闭时触发。 |
| `OnError` | `Func<string, Task>` | 返回摄像头、解码器和互操作错误。 |
| `Decodeonce` | `bool` | 选择单次或连续解码。 |
| `DecodeAllFormats` | `bool` | 启用所有支持的格式，可通过 `Options.formats` 缩小范围。 |
| `AlsoInverted` | `bool` | 启用反色条码识别。 |
| `DeviceID` | `string?` | 指定首选摄像头。 |
| `SaveDeviceID` | `bool` | 保存最后使用且仍可用的摄像头。 |
| `UseBuiltinDiv` | `bool` | 使用内置界面或自定义 `data-action` 控件。 |
| `Options` | `ZXingOptions?` | 配置格式、图像质量、尺寸和高级解码提示。 |

更多配置请查看 [`ZXingOptions.cs`](src/ZXingBlazor/ZXingOptions.cs) 和[在线示例](https://densen2014.github.io/ZXingBlazor/)。

## 运行示例工程

两个示例工程均已升级到 .NET 10：

```bash
dotnet run --project Demo.Wasm/Demo.Wasm.csproj
dotnet run --project Demo.Server/Demo.Server.csproj
```

## 参与贡献

1. Fork 本仓库。
2. 创建功能分支。
3. 完成并验证修改。
4. 提交 Pull Request。
