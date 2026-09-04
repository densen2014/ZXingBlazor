namespace ZXingBlazor.Components;

/// <summary>
/// Provides the decoded text and captured camera frame for a successful scan.
/// </summary>
public sealed class ScanCapturedEventArgs
{
    /// <summary>
    /// Gets the decoded barcode text.
    /// </summary>
    public string Text { get; init; } = string.Empty;

    /// <summary>
    /// Gets the captured frame as a JPEG data URL.
    /// </summary>
    public string ImageDataUrl { get; init; } = string.Empty;
}
