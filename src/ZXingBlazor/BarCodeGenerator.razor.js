import '/_content/ZXingBlazor/JsBarcode.all.min.js';
  
export function Gen(instance, element,input) {

    JsBarcode("#code128", input);
    JsBarcode("#ean-13", "1234567890128", { format: "ean13" });
    JsBarcode("#ean-8", "12345670", { format: "ean8" });
    JsBarcode("#ean-5", "12345", { format: "ean5" });
    JsBarcode("#ean-2", "12", { format: "ean2" });
    JsBarcode("#upc-a", "123456789012", { format: "upc" });
    JsBarcode("#code39", input, { format: "code39" });
    JsBarcode("#itf-14", "1234567890123", { format: "itf14" });
    JsBarcode("#msi", "123456", { format: "msi" });
    JsBarcode("#pharmacode", "12345", { format: "pharmacode" });

}
 