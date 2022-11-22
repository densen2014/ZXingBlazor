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
}


