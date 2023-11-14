// ********************************** 
// Densen Informatica 中讯科技 
// 作者：Alex Chow
// e-mail:zhouchuanglin@gmail.com 
// **********************************

using System.Text.Json.Serialization;

namespace ZXingBlazor.Components;

/// <summary>
/// ZXing 选项类
/// </summary>
/// <remarks>https://zxing.github.io/zxing/apidocs/com/google/zxing/DecodeHintType.htm</remarks>
public class ZXingOptions
{
    /// <summary>
    /// 只解码 Pdf417 格式 / decode only Pdf417 format
    /// </summary>
    public bool Pdf417 { get; set; }

    /// <summary>
    /// 单次|连续解码,默认单次 / Decode Once or Decode Continuously, default is Once
    /// </summary>
    public bool Decodeonce { get; set; } = true;

    /// <summary>
    /// Time Between Decoding Attempts 
    /// </summary>
    public int TimeBetweenDecodingAttempts { get; set; } = 10;

    /// <summary>
    /// 解码所有编码形式,性能较差, 开启后可用 options.formats 指定编码形式.默认为 false | Decodde All Formats, performance is poor, you can set options.formats to customize specify the encoding formats. The default is false
    /// </summary>
    public bool DecodeAllFormats { get; set; }

    /// <summary>
    /// 已知图像是几种可能的格式之一。
    /// </summary>
    public List<BarcodeFormat> formats { get; set; } = new List<BarcodeFormat>() {
        BarcodeFormat.AZTEC ,
        BarcodeFormat.CODABAR,
        BarcodeFormat.CODE_39,
        BarcodeFormat.CODE_93,
        BarcodeFormat.CODE_128,
        BarcodeFormat.DATA_MATRIX,
        BarcodeFormat.EAN_8,
        BarcodeFormat.EAN_13,
        BarcodeFormat.ITF,
        BarcodeFormat.MAXICODE,
        BarcodeFormat.PDF_417,
        BarcodeFormat.QR_CODE,
        BarcodeFormat.RSS_14,
        BarcodeFormat.RSS_EXPANDED,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.UPC_EAN_EXTENSION,
    };

    public bool Debug { get; set; }

    ///// <summary>
    ///// 如果为 true，尝试解码为倒置图像。所有配置的解码器都被简单地用倒置图像第二次调用
    ///// </summary>
    //[JsonPropertyName("ALSO_INVERTED")]
    //public bool ALSO_INVERTED { get; set; }

    /// <summary>
    /// EAN 或 UPC 条形码允许的扩展长度, 默认为 2.
    /// </summary>
    [JsonPropertyName("ALLOWED_EAN_EXTENSIONS")]
    public int[]? ALLOWED_EAN_EXTENSIONS { get; set; } //= new int[] { 2 };

    /// <summary>
    /// 允许的编码数据长度——拒绝任何其他长度
    /// </summary>
    [JsonPropertyName("ALLOWED_LENGTHS")]
    public int[]? ALLOWED_LENGTHS { get; set; }

    /// <summary>
    /// 假设 Code 39 代码使用校验位。
    /// </summary>
    [JsonPropertyName("ASSUME_CODE_39_CHECK_DIGIT")]
    public bool? ASSUME_CODE_39_CHECK_DIGIT { get; set; }

    /// <summary>
    /// 假设条形码正在作为 GS1 条形码进行处理，并根据需要修改行为
    /// </summary>
    [JsonPropertyName("ASSUME_GS1")]
    public bool? ASSUME_GS1 { get; set; }

    /// <summary>
    /// 指定解码时使用的字符编码（如果适用）
    /// </summary>
    [JsonPropertyName("CHARACTER_SET")]
    public string? CHARACTER_SET { get; set; }

    ///// <summary>
    /////  ResultPoint 当发现可能的情况时，需要通过回调通知调用者, 映射到一个ResultPointCallback
    ///// </summary>
    //public object NEED_RESULT_POINT_CALLBACK { get; set; }

    /// <summary>
    /// 未指定的、特定于应用程序的提示。
    /// </summary>
    [JsonPropertyName("OTHER")]
    public object? OTHER { get; set; }

    /// <summary>
    /// 图像是条形码的纯单色图像。
    /// </summary>
    [JsonPropertyName("PURE_BARCODE")]
    public bool? PURE_BARCODE { get; set; }

    /// <summary>
    /// 如果为 true，则返回 Codabar 条形码中的开始和结束数字，而不是剥离它们
    /// <remark>如果为 true，则返回 Codabar 条形码中的开始和结束数字，而不是剥离它们。它们是字母，而其余的是数字。默认情况下，它们会被剥离，但这会导致它们不会被剥离</remark>
    /// </summary>
    [JsonPropertyName("RETURN_CODABAR_START_END")]
    public bool? RETURN_CODABAR_START_END { get; set; }

    /// <summary>
    /// 花更多的时间尝试寻找条形码；优化准确性，而不是速度
    /// </summary>
    [JsonPropertyName("TRY_HARDER")]
    public bool? TRY_HARDER { get; set; } 
}


/**
 * Enumerates barcode formats known to this package. Please keep alphabetized.
 *
 * @author Sean Owen
 */
public enum BarcodeFormat
{

    /** Aztec 2D barcode format. */
    AZTEC,

    /** CODABAR 1D format. */
    CODABAR,

    /** Code 39 1D format. */
    CODE_39,

    /** Code 93 1D format. */
    CODE_93,

    /** Code 128 1D format. */
    CODE_128,

    /** Data Matrix 2D barcode format. */
    DATA_MATRIX,

    /** EAN-8 1D format. */
    EAN_8,

    /** EAN-13 1D format. */
    EAN_13,

    /** ITF (Interleaved Two of Five) 1D format. */
    ITF,

    /** MaxiCode 2D barcode format. */
    MAXICODE,

    /** PDF417 format. */
    PDF_417,

    /** QR Code 2D barcode format. */
    QR_CODE,

    /** RSS 14 */
    RSS_14,

    /** RSS EXPANDED */
    RSS_EXPANDED,

    /** UPC-A 1D format. */
    UPC_A,

    /** UPC-E 1D format. */
    UPC_E,

    /** UPC/EAN extension format. Not a stand-alone format. */
    UPC_EAN_EXTENSION

}
