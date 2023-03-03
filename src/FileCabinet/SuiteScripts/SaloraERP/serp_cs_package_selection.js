/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(["N/record", "N/search","N/ui/message","N/ui/dialog"], /**
 * @param{record} record
 */ function (record, search,message,dialog) {
  /**
   * Function to be executed after page is initialized.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
   *
   * @since 2015.2
   */
  function pageInit(scriptContext) {
    try {
      let curRec = scriptContext.currentRecord;
      let customer = curRec.getValue("entity");
      let packageField = curRec.getField("custbody_serp_select_package");
      if (customer === "") {
        packageField.isDisabled = true;
      } else {
        packageField.isDisabled = false;
      }
    } catch (e) {
      log.debug("pageInit", e.message);
    }
  }

  /**
   * Function to be executed when field is slaved.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   * @param {string} scriptContext.fieldId - Field name
   *
   * @since 2015.2
   */
  function fieldChanged(scriptContext) {
    let curRec = scriptContext.currentRecord;
    try {
      let fieldId = scriptContext.fieldId;

      if (fieldId === "entity") {
        let entity = curRec.getValue({ fieldId: "entity" });
        let packageField = curRec.getField("custbody_serp_select_package");
        log.debug("Entity", entity);
        if (entity !== "") {
          log.debug("entity = null");
          packageField.isDisabled = false;
        } else {
          packageField.isDisabled = true;
        }
      }

      if (fieldId === "custbody_serp_select_package") {
        let lineCount = curRec.getLineCount("item");


        let selectedPackageName = curRec.getText("custbody_serp_select_package")
          message.create({
            title: 'Package Confirmation',
            message: `Setting ${selectedPackageName} items. Please wait`,
            type: message.Type.INFORMATION
          }).show({
            duration: 5000
          })
          setTimeout(function (){
            let selectPackage = curRec.getValue("custbody_serp_select_package");
            let lineCount = curRec.getLineCount("item");
            let itemList = lookForPackageItem(selectPackage);
            let line = 0
            if(lineCount > itemList.length){
             for(let i = 0; i<= lineCount; i++){
               if(!itemList[0][i]){
                 curRec.removeLine({
                   sublistId: "item",
                   line: i
                 })
               }else{
                 curRec.selectLine({
                   sublistId: "item",
                   line: i
                 });
                 curRec.setCurrentSublistValue({
                   sublistId: "item",
                   fieldId: "item",
                   value: itemList[0][i].itemId,
                   fireSlavingSync: true,
                 });
                 curRec.setCurrentSublistValue({
                   sublistId: "item",
                   fieldId: "quantity",
                   value:itemList[0][i].quantity,
                 });
                 curRec.setCurrentSublistValue({
                   sublistId: "item",
                   fieldId: "pricelevels",
                   value: -1,
                 });
                 curRec.setCurrentSublistValue({
                   sublistId: "item",
                   fieldId: "rate",
                   value: itemList[0][i].rate,
                 });
                 curRec.commitLine("item");
                 curRec.selectNewLine({ sublistId: "item" });
               }
             }
            }else{
              itemList.forEach((item) => {
                curRec.selectLine({
                  sublistId: "item",
                  line: line
                });
                curRec.setCurrentSublistValue({
                  sublistId: "item",
                  fieldId: "item",
                  value: item.itemId,
                  fireSlavingSync: true,
                });
                curRec.setCurrentSublistValue({
                  sublistId: "item",
                  fieldId: "quantity",
                  value: item.quantity,
                });
                curRec.setCurrentSublistValue({
                  sublistId: "item",
                  fieldId: "pricelevels",
                  value: -1,
                });
                curRec.setCurrentSublistValue({
                  sublistId: "item",
                  fieldId: "rate",
                  value: item.rate,
                });
                curRec.commitLine("item");
                curRec.selectNewLine({ sublistId: "item" });
                line ++
              });
            }

          },1000)
        }

    } catch (e) {
      log.debug("fieldChanged", e.message);
    }
  }

  /**
   * Look for the child subrecord of the item package
   * @param packageId
   * @returns item list from package
   */
  function lookForPackageItem(packageId) {
    let itemPackage = [];
    const customrecord_pacakge_itemsSearchObj = search.create({
      type: "customrecord_pacakge_items",
      filters: [["custrecord_serp_item_package", "anyof", packageId]],
      columns: [
        search.createColumn({
          name: "custrecord_serp_item_package_list_item",
          label: "Item",
        }),
        search.createColumn({
          name: "custrecord_serp_item_package_list_rate",
          label: "Rate",
        }),
        search.createColumn({
          name: "custrecord_serp_item_package_list_qty",
          label: "Quantity",
        }),
      ],
    });
    let searchResultCount =
      customrecord_pacakge_itemsSearchObj.runPaged().count;
    if (searchResultCount < 0) return;
    customrecord_pacakge_itemsSearchObj.run().each(function (result) {
      itemPackage.push({
        itemId: result.getValue("custrecord_serp_item_package_list_item"),
        rate: result.getValue("custrecord_serp_item_package_list_rate"),
        quantity: result.getValue("custrecord_serp_item_package_list_qty"),
      });
      return true;
    });
    return itemPackage;
  }

  return {
    pageInit: pageInit,
    fieldChanged: fieldChanged,
  };
});
