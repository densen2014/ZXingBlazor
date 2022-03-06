// ********************************** 
// Densen Informatica 中讯科技 
// 作者：Alex Chow
// e-mail:zhouchuanglin@gmail.com 
// **********************************

using System.ComponentModel;


namespace ZXingBlazor.Components;

/// <summary>
/// 图片浏览器选项类
/// </summary>
public class ViewerOptions
{
    /// <summary>
    /// 图片浏览器选项
    /// </summary>
    /// <param name="id"></param>
    /// <param name="fullscreen"></param>
    public ViewerOptions(string id = "images", bool fullscreen = true)
    {
        this.id = id;
        this.fullscreen = fullscreen;
    }
    public string id { get; set; } = "images";

    /// <summary>
    /// 简化版工具条
    /// </summary>
    public bool toolbarlite { get; set; }
    public string container { get; set; } = "body";

    /// <summary>
    /// 背景遮罩
    /// </summary>
    [DisplayName("背景遮罩")]
    public bool backdrop { get; set; } = true;

    /// <summary>
    /// 右上角的关闭按钮
    /// </summary>
    [DisplayName("关闭按钮")]
    public bool button { get; set; } = true;

    public bool focus { get; set; } = true;

    /// <summary>
    /// 全屏
    /// </summary>
    [DisplayName("全屏")]
    public bool fullscreen { get; set; } = true;

    /// <summary>
    /// 内联/模态模式
    /// </summary>
    [DisplayName("内联/模态模式")]
    public bool inline { get; set; } = false;

    /// <summary>
    /// 
    /// </summary>
    public int interval { get; set; } = 5000;

    /// <summary>
    /// 键盘导航快捷键
    /// </summary>
    [DisplayName("键盘导航快捷键")]
    public bool keyboard { get; set; } = true;

    /// <summary>
    /// 
    /// </summary>
    public bool loading { get; set; } = true;

    /// <summary>
    /// 循环播放
    /// </summary>
    [DisplayName("循环播放")]
    public bool loop { get; set; } = true;

    /// <summary>
    /// 
    /// </summary>
    public int maxZoomRatio { get; set; } = 100;

    /// <summary>
    /// 
    /// </summary>
    public int minHeight { get; set; } = 100;

    /// <summary>
    /// 
    /// </summary>
    public int minWidth { get; set; } = 200;

    /// <summary>
    /// 
    /// </summary>
    public double minZoomRatio { get; set; } = 0.01;

    /// <summary>
    /// 可移动
    /// </summary>
    [DisplayName("可移动")]
    public bool movable { get; set; } = true;

    /// <summary>
    /// 导航
    /// </summary>
    [DisplayName("导航")]
    public bool navbar { get; set; } = true;

    /// <summary>
    /// 可旋转
    /// </summary>
    [DisplayName("可旋转")]
    public bool rotatable { get; set; } = true;

    /// <summary>
    /// 可缩放
    /// </summary>
    [DisplayName("可缩放")]
    public bool scalable { get; set; } = true;

    /// <summary>
    /// 滑动触摸
    /// </summary>
    [DisplayName("滑动触摸")]
    public bool slideOnTouch { get; set; } = true;

    /// <summary>
    /// 标题
    /// </summary>
    [DisplayName("标题")]
    public bool title { get; set; } = true;

    /// <summary>
    /// 双击切换
    /// </summary>
    [DisplayName("双击切换")]
    public bool toggleOnDblclick { get; set; } = true;

    /// <summary>
    /// 工具栏
    /// </summary>
    [DisplayName("工具栏")]
    public bool toolbar { get; set; } = true;

    /// <summary>
    /// 工具提示
    /// </summary>
    [DisplayName("工具提示")]
    public bool tooltip { get; set; } = true;

    /// <summary>
    /// 过渡效果
    /// </summary>
    [DisplayName("过渡效果")]
    public bool transition { get; set; } = true;

    /// <summary>
    /// 触摸缩放
    /// </summary>
    [DisplayName("触摸缩放")]
    public bool zoomOnTouch { get; set; } = true;

    /// <summary>
    /// 滚轮缩放
    /// </summary>
    [DisplayName("触摸缩放")]
    public bool zoomOnWheel { get; set; } = true;

    /// <summary>
    /// 缩放率
    /// </summary>
    [DisplayName("缩放率")]
    public double zoomRatio { get; set; } = 0.1;

    /// <summary>
    /// 可缩放
    /// </summary>
    [DisplayName("可缩放")]
    public bool zoomable { get; set; } = true;
}


