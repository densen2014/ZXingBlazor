﻿# ZXing Blazor Component 0.2.6

English | <a href="https://blazor.app1.es/"> Other Blazor components</a>

---

## Introduction

This project is a Blazor component library packaged with ZXing, Support barcode, QR code, PDF417 format.

## Demo

https://zxingblazor.app1.es

https://zxingblazorwasm.app1.es

## Nuget

https://www.nuget.org/packages/ZXingBlazor/

## Screenshot
![ZXingBlazor](https://user-images.githubusercontent.com/8428709/94275844-c28cf500-ff47-11ea-9c65-2370752d2b5b.gif) 

## Instructions:

1. NuGet install pack 

    `ZXingBlazor`

2. _Imports.razor or Razor page

   ```
   @using ZXingBlazor.Components
   ``` 
   
3. Razor page

    Razor  
    <https://github.com/densen2014/ZXingBlazor/blob/master/Demo.Server/Pages/Index.razor>
    ```
        <b>Result:</b>
        <br />
        <pre>@BarCode</pre>

        <BarcodeReader ScanResult="ScanResult" />


    @code{

        /// <summary>
        /// BarCode
        /// </summary>
        public string? BarCode { get; set; }

        private void ScanResult(string e)
        {
            BarCode = e;
            ShowScanBarcode = !ShowScanBarcode;
        }
    }

    ```
## Updates

2022.11.23 Add optiones

1. Pdf417Only: decode only Pdf417 format
2. Decodeonce: decode Once or Decode Continuously, default is Once
3. DecodeAllFormats: decodde All Formats, performance is poor, you can set options.formats to customize specify the encoding formats. The default is false

2022.3.6 Upgrade to js isolated version, add image browser Viewer component, and upgrade demo project to net6 format

2021.5.13 BarcodeReader supports defining button text and supports multiple languages

## Participate in contribution

1. Fork this project
2. Create new Feat_xxx branch
3. Submit the code
4. New Pull Request


----

# ZXing Blazor 扫码组件 0.2.6

 <a href="https://blazor.app1.es/"> 其他 Blazor 组件</a>

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

## 使用步骤:

1. 安装 NuGet 包 

    `ZXingBlazor`

2. _Imports.razor 或者 Razor 页面引用

   ```
   @using ZXingBlazor.Components
   ``` 
   
3. Razor 页面代码

    Razor  
    <https://github.com/densen2014/ZXingBlazor/blob/master/Demo.Server/Pages/Index.razor>
    ```
        <b>Result:</b>
        <br />
        <pre>@BarCode</pre>

        <BarcodeReader ScanResult="ScanResult" />


    @code{

        /// <summary>
        /// BarCode
        /// </summary>
        public string? BarCode { get; set; }

        private void ScanResult(string e)
        {
            BarCode = e;
            ShowScanBarcode = !ShowScanBarcode;
        }
    }

    ```
    
## 更新

2022.11.23 添加选项

1. Pdf417Only: 只解码 Pdf417 格式 / decode only Pdf417 format
2. Decodeonce: 单次|连续解码,默认单次 / Decode Once or Decode Continuously, default is Once
3. DecodeAllFormats: 解码所有编码形式,性能较差, 开启后可用 options.formats 指定编码形式.默认为 false | Decodde All Formats, performance is poor, you can set options.formats to customize specify the encoding formats. The default is false


2022.3.6 升级为js隔离版本,添加图片浏览器 Viewer组件, 演示工程升级为net6格式

2021.5.13 BarcodeReader 支持定义按钮文本,支持多语言


## 参与贡献

1. Fork 本项目
2. 新建 Feat_xxx 分支
3. 提交代码
4. 新建 Pull Request 
