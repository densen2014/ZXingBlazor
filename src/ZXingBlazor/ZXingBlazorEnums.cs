// ********************************** 
// Densen Informatica 中讯科技 
// 作者：Alex Chow
// e-mail:zhouchuanglin@gmail.com 
// **********************************

using System.ComponentModel;
using System.Text.Json.Serialization;

namespace ZXingBlazor.Components;

public enum ZXingBlazorStyle
{
    /// <summary>
    /// 弹窗
    /// </summary>
    [Description("弹窗")]
    Modal,

    /// <summary>
    /// 内嵌
    /// </summary>
    [Description("内嵌")]
    Embedded
}

