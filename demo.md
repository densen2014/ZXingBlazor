1. Create a new projet
```
dotnet new blazorserver -o demo1
dotnet sln add demo1/demo1.csproj
dotnet add demo1 package ZXingBlazor
```

2. In Pages/Index.razor
```
@using ZXingBlazor.Components
<button class="btn btn-primary"
        type="button"
        @onclick="(() => ShowScanBarcode = !ShowScanBarcode)">
    [Sacn]
</button>
<input type="text" class="form-control" style="min-width: 100px;"
       @bind-value="BarCode"
       placeholder="BarCode" />
@if (ShowScanBarcode)
{

    <BarcodeReader ScanResult="((e) => { BarCode=e; ShowScanBarcode = !ShowScanBarcode; })"
                   ShowScanBarcode="ShowScanBarcode"
                   Close="(()=>ShowScanBarcode=!ShowScanBarcode)"
                   ScanBtnTitle="Scan"
                   ResetBtnTitle="Reset"
                   CloseBtnTitle="Close"
                   SelectDeviceBtnTitle="Select Device" />

}

@code{
    /// <summary>
    /// Display the scan code interface
    /// </summary>
    bool ShowScanBarcode { get; set; } = false;

    /// <summary>
    /// BarCode
    /// </summary>
    public string? BarCode { get; set; }

    private string message;

    private Task OnError(string message)
    {
        this.message = message;
        StateHasChanged();
        return Task.CompletedTask;
    }
}
```

3. Run
```
cd demo1
dotnet run
```