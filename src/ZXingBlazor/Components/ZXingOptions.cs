// ********************************** 
// Densen Informatica 中讯科技 
// 作者：Alex Chow
// e-mail:zhouchuanglin@gmail.com 
// **********************************

using System.ComponentModel;


namespace ZXingBlazor.Components;

/// <summary>
/// ZXing 选项类
/// </summary>
public class ZXingOptions
{
    /// <summary>
    /// decode only Pdf417 format
    /// </summary>
    public bool Pdf417 { get; set; }

    /// <summary>
    /// decodeOnce or decodeContinuously
    /// </summary>
    public bool Decodeonce { get; set; } = true;

    /// <summary>
    /// Time Between Decoding Attempts 
    /// </summary>
    public int TimeBetweenDecodingAttempts { get; set; } = 10;

    public bool DecoddeAllFormats { get; set; }

    public List<BarcodeFormat> formats { get; set; }= new List<BarcodeFormat>() {
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
