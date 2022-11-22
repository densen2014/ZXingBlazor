# ZXing Blazor Component 0.2.5

English | <a href="README.zh-CN.md">中文</a>  | <a href="https://github.com/densen2014/FreeSqlDemos/blob/master/MyDemos.md"> Orther demos</a>

---

## Introduction
This project is a Blazor component library packaged with ZXing, Support barcode, QR code, PDF417 format.

## Demo  
ssr
https://zxingblazor.app1.es

wasm
https://zxingblazorwasm.app1.es

## Nuget
https://www.nuget.org/packages/ZXingBlazor/

## Step
_Imports.razor 

    @using ZXingBlazor.Components
    
# <font color='red'>[Destructive upgrade] The file Pages/_Host.cshtml or wasm project is wwwroot/index.html, no need to add references!!!!</font> 
# If it is an upgrade from an older version, please remove the reference of zxing.js
> 
> !!REMOVE!!    <script src="_content/ZXingBlazor/lib/barcodereader/zxing.js"></script>
> 
> !!REMOVE!!    <script src="_content/ZXingBlazor/lib/barcodereader/barcode.js"></script>

> The new version use [JavaScript isolation in JavaScript modules](https://docs.microsoft.com/en-us/aspnet/core/blazor/javascript-interoperability/?view=aspnetcore-6.0#javascript-isolation-in-javascript-modules)
> 
> Blazor enables JavaScript (JS) isolation in standard [JavaScript modules](https://developer.mozilla.org/docs/Web/JavaScript/Guide/Modules) ([ECMAScript specification](https://tc39.es/ecma262/#sec-modules)).
> 
> JS isolation provides the following benefits:
> 
> - Imported JS no longer pollutes the global namespace.
> - Consumers of a library and components aren't required to import the related JS.


In your Blazor page

![QQ图片20200926035359](https://user-images.githubusercontent.com/8428709/94327539-fd287900-ffab-11ea-8783-a26cd5f29f9a.png)


## Screenshot
![ZXingBlazor](https://user-images.githubusercontent.com/8428709/94275844-c28cf500-ff47-11ea-9c65-2370752d2b5b.gif) 

## New Components
Handwritten  2020.10.05
![Sign](https://user-images.githubusercontent.com/8428709/95032378-96e1db80-06ba-11eb-8291-c00c3c2ea9fb.gif)

ImageViewer  2022.3.6
    

## Updates

2022.3.6 Upgrade to js isolated version, add image browser Viewer component, and upgrade demo project to net6 format

2021.5.13 BarcodeReader supports defining button text and supports multiple languages

-----
now support set button text:
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



## Participate in contribution

1. Fork this project
2. Create new Feat_xxx branch
3. Submit the code
4. New Pull Request
