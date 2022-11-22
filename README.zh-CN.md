# ZXing Blazor 扫码组件 0.2.5

 <a href="README.md">English</a> |中文  | <a href="https://github.com/densen2014/FreeSqlDemos/blob/master/MyDemos.md"> 其他demo</a>

---

## 项目介绍
本项目是利用 ZXing 进行封装的 Blazor 组件库, 支持条码,二维码,PDF417格式.

## 演示地址  
ssr
https://zxingblazor.app1.es

wasm
https://zxingblazorwasm.app1.es


## Nuget 包安装
https://www.nuget.org/packages/ZXingBlazor/

## 使用 

_Imports.razor 

    @using ZXingBlazor.Components


## [破坏性升级] 文件Pages/_Host.cshtml,  wasm项目对应文件是 wwwroot/index.html 都无需添加引用!!!!
## 如果是旧版升级上来,请移除zxing.js引用
>  !!移除!!   <script src="_content/ZXingBlazor/lib/barcodereader/zxing.js"></script>
>  
>  !!移除!!   <script src="_content/ZXingBlazor/lib/barcodereader/barcode.js"></script>

> 新版使用了[JavaScript 模块中的 JavaScript 隔离](https://docs.microsoft.com/zh-cn/aspnet/core/blazor/javascript-interoperability/?view=aspnetcore-6.0#javascript-isolation-in-javascript-modules)
> 
> Blazor 在标准 Blazor（JS）中启用 JavaScript (JS) 隔离。
> 
> JS 隔离具有以下优势：
> 
> - 导入的 JS 不再污染全局命名空间。
> - 库和组件的使用者不需要导入相关的 JS。
> 有关详细信息，请参阅 Call JavaScript functions from .NET methods in ASP.NET Core Blazor。


在Blazor页面添加代码
![QQ图片20200926035359](https://user-images.githubusercontent.com/8428709/94327539-fd287900-ffab-11ea-8783-a26cd5f29f9a.png)


## 项目截图
![ZXingBlazor](https://user-images.githubusercontent.com/8428709/94275844-c28cf500-ff47-11ea-9c65-2370752d2b5b.gif)

## 新加模块
手写签名 Handwritten 组件 2020.10.05
![Sign](https://user-images.githubusercontent.com/8428709/95032378-96e1db80-06ba-11eb-8291-c00c3c2ea9fb.gif)

图片浏览器Viewer 组件 2022.3.6
    
## 更新

2022.3.6 升级为js隔离版本,添加图片浏览器 Viewer组件, 演示工程升级为net6格式

2021.5.13 BarcodeReader 支持定义按钮文本,支持多语言

----
定义按钮文本:
code
https://github.com/densen2014/ZXingBlazor/blob/master/Demo.Server/Pages/IndexEN.razor
demo
https://zxingblazor.app1.es/

```
    <BarcodeReader ScanResult="((e) => { BarCode=e; ShowScanBarcode = !ShowScanBarcode; })"
                   ShowScanBarcode="ShowScanBarcode"
                   Close="(()=>ShowScanBarcode=!ShowScanBarcode)" 
                   ScanBtnTitle="Scan"
                   ResetBtnTitle="Reset"
                   CloseBtnTitle="Close"
                   SelectDeviceBtnTitle="Select Device"
                   />
```

![barcode](https://user-images.githubusercontent.com/8428709/118119633-f6416000-b3ee-11eb-8537-ec356242f63b.jpg)



## 参与贡献

1. Fork 本项目
2. 新建 Feat_xxx 分支
3. 提交代码
4. 新建 Pull Request 
