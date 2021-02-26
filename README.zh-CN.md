# ZXing Blazor 扫码组件

 <a href="README.md">English</a> |中文

---

## 项目介绍
本项目是利用 ZXing 进行封装的 Blazor 组件库 

## 演示地址  
ssr
https://zxingblazor.app1.es

wasm
https://densen2014.github.io/


## Nuget 包安装
https://www.nuget.org/packages/ZXingBlazor/

## 使用 

_Imports.razor 

@using ZXingBlazor.Components


在文件Pages/_Host.cshtml添加引用,  wasm项目对应文件是 wwwroot/index.html

    <script src="_content/ZXingBlazor/lib/barcodereader/zxing.js"></script>
    <script src="_content/ZXingBlazor/lib/barcodereader/barcode.js"></script>

在Blazor页面添加代码
![QQ图片20200926035359](https://user-images.githubusercontent.com/8428709/94327539-fd287900-ffab-11ea-8783-a26cd5f29f9a.png)


## 项目截图
![ZXingBlazor](https://user-images.githubusercontent.com/8428709/94275844-c28cf500-ff47-11ea-9c65-2370752d2b5b.gif)

## 新加模块
手写签名 Handwritten 组件 2020.10.05
![Sign](https://user-images.githubusercontent.com/8428709/95032378-96e1db80-06ba-11eb-8291-c00c3c2ea9fb.gif)

Pages/_Host.cshtml  , in wasm is: wwwroot/index.html

    <script src="_content/ZXingBlazor/lib/handwritten/handwritten.js"></script>
    
## 参与贡献

1. Fork 本项目
2. 新建 Feat_xxx 分支
3. 提交代码
4. 新建 Pull Request 
