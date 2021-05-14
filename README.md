# ZXing Blazor Component

English | <a href="README.zh-CN.md">中文</a>

---

## Introduction
This project is a Blazor component library packaged with ZXing

## Demo  
ssr
https://zxingblazor.app1.es

wasm
https://densen2014.github.io/

## Nuget
https://www.nuget.org/packages/ZXingBlazor/

## Step
_Imports.razor 

    @using ZXingBlazor.Components

Pages/_Host.cshtml  , in wasm is: wwwroot/index.html

    <script src="_content/ZXingBlazor/lib/barcodereader/zxing.js"></script>
    <script src="_content/ZXingBlazor/lib/barcodereader/barcode.js"></script>

In your Blazor page

![QQ图片20200926035359](https://user-images.githubusercontent.com/8428709/94327539-fd287900-ffab-11ea-8783-a26cd5f29f9a.png)


## Screenshot
![ZXingBlazor](https://user-images.githubusercontent.com/8428709/94275844-c28cf500-ff47-11ea-9c65-2370752d2b5b.gif) 

## New Components
Handwritten  2020.10.05
![Sign](https://user-images.githubusercontent.com/8428709/95032378-96e1db80-06ba-11eb-8291-c00c3c2ea9fb.gif)

Pages/_Host.cshtml  , in wasm is: wwwroot/index.html

    <script src="_content/ZXingBlazor/lib/handwritten/handwritten.js"></script>
    

## Updates
2021-5-13 BarcodeReader supports defining button text and supports multiple languages
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
