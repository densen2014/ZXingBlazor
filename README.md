# ZXingBlazor

[中文](README.zh-CN.md) · [Live demo](https://densen2014.github.io/ZXingBlazor/) · [NuGet](https://www.nuget.org/packages/ZXingBlazor/) · [GitHub](https://github.com/densen2014/ZXingBlazor)

ZXingBlazor is a camera barcode reader for Blazor. It supports Blazor WebAssembly and Blazor Server on .NET 6 through .NET 10.

## Features

- Scan QR Code, Data Matrix, PDF417, and common 1D barcode formats.
- Use mobile and desktop cameras with camera selection and remembered device IDs.
- Choose one-shot or continuous decoding.
- Recognize regular and inverted barcodes without opening a second camera stream.
- Capture the video frame when a scan succeeds.
- Use the built-in scanner UI or provide custom `data-action` controls.
- Decode barcodes from images and generate QR codes with the companion `BarCodes` component.
- Load JavaScript through component isolation; no script tags are required.

## Demo

The .NET 10 WebAssembly sample is deployed to GitHub Pages:

**https://densen2014.github.io/ZXingBlazor/**

Source: [`Demo.Wasm/Pages/Index.razor`](Demo.Wasm/Pages/Index.razor)

GitHub Pages only hosts static files, so the hosted sample uses standalone Blazor WebAssembly. Blazor Interactive Auto requires an ASP.NET Core server for its initial interactive server rendering and can't run as a static Pages deployment.

## Getting started

### 1. Install the package

```bash
dotnet add package ZXingBlazor
```

### 2. Import the namespace

Add the namespace to `_Imports.razor` or to the Razor component that uses the scanner:

```razor
@using ZXingBlazor.Components
```

### 3. Add the scanner

```razor
<button class="btn btn-primary" @onclick="(() => scannerVisible = true)">
    Scan
</button>

@if (scannerVisible)
{
    <BarcodeReader ScanResult="OnScanResult"
                   Close="(() => scannerVisible = false)"
                   OnError="OnError" />
}

@if (!string.IsNullOrWhiteSpace(result))
{
    <p>Result: @result</p>
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

Camera access requires HTTPS in production. Browsers also allow camera access on `localhost` during development.

## Capture the scanned frame

Set `CaptureStillOnScan` and handle `ScanCaptured` to receive both the decoded text and a JPEG data URL:

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

The image is transferred with streaming JavaScript interop, which avoids the default Blazor Server message-size limit for large images.

## Key parameters and callbacks

| Name | Type | Description |
| --- | --- | --- |
| `ScanResult` | `EventCallback<string>` | Returns decoded text. |
| `ScanCaptured` | `EventCallback<ScanCapturedEventArgs>` | Returns decoded text and the captured JPEG data URL. |
| `Close` | `EventCallback` | Raised when the scanner UI closes. |
| `OnError` | `Func<string, Task>` | Reports camera, decoder, and interop errors. |
| `Decodeonce` | `bool` | Selects one-shot or continuous decoding. |
| `DecodeAllFormats` | `bool` | Enables all supported formats. Use `Options.formats` to narrow the list. |
| `AlsoInverted` | `bool` | Enables inverted barcode recognition. |
| `DeviceID` | `string?` | Selects a preferred camera. |
| `SaveDeviceID` | `bool` | Remembers the last available camera. |
| `UseBuiltinDiv` | `bool` | Uses the built-in UI or custom `data-action` controls. |
| `Options` | `ZXingOptions?` | Configures formats, image quality, dimensions, and decoding hints. |

See [`ZXingOptions.cs`](src/ZXingBlazor/ZXingOptions.cs) and the [live demo](https://densen2014.github.io/ZXingBlazor/) for more examples.

## Build the samples

Both sample projects target .NET 10:

```bash
dotnet run --project Demo.Wasm/Demo.Wasm.csproj
dotnet run --project Demo.Server/Demo.Server.csproj
```

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Add and validate your changes.
4. Open a pull request.
