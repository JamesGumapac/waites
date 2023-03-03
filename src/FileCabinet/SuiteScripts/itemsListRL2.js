/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 *
 * Return all quoteable ITEMs
 *
 */
define(['N/search','N/record','N/file'],
    function(search,record) {
        /**
         * Function called upon sending a GET request to the RESTlet.
         *
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
         * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
         * @since 2015.1
         */
        function doGet() {

            try{
                log.debug('Starting doGet');

                var returnArray = [];

                // var itemSearchObj = search.load({
                //     id: 'customsearch429'//you will input the id of the saved search
                // });

                var itemSearchObj = search.create({
                    type: search.Type.ASSEMBLY_ITEM,
                    columns:
                        [
                            search.createColumn({name: "internalid", sort: search.Sort.ASC, label: "Internal Id"}),
                            search.createColumn({name: "itemid", label: "Name"}),
                            search.createColumn({name: "custitem_atlas_item_image", label: "Image"}),
                            search.createColumn({name: "displayname", label: "Display Name"}),
                            search.createColumn({name: "salesdescription", label: "Description"}),
                            search.createColumn({name: "type", label: "Type"}),
                            search.createColumn({name: "baseprice", label: "Base Price"}),
                            search.createColumn({name: "custitem_quote_item", label: "Quoteable Item"}),
                            search.createColumn({name: "cost", label: "Purchase Price"}),
                            search.createColumn({name: "vendor", label: "Preferred Vendor"})
                        ]
                });
                // log.debug("itemSearchObj" ,itemSearchObj);
                var searchResultCount = itemSearchObj.runPaged().count;
                log.debug("itemSearchObj result count",searchResultCount);
                itemSearchObj.run().each(function(result){
                    obj = {}
                    obj.internalId = result.getValue({name: "internalid"})
                    obj.type = result.getValue({name: "type"})
                    obj.itemname = result.getValue({name: "itemid"})
                    obj.displayname = result.getValue({name: "displayname"})
                    obj.salesdescription = result.getValue({name: "salesdescription"})
                    obj.custitem_atlas_item_image = result.getValue({name: "custitem_atlas_item_image"})
                    if(obj.custitem_atlas_item_image !== ""){
                      log.debug('search file id ', obj.custitem_atlas_item_image);
                      var fileObj = file.load({id:obj.custitem_atlas_item_image});
					  imgURL = fileObj.url;
                      log.debug('fileURl', imgURL);
                      obj.custitem_atlas_item_image = imgURL
                    }

                    returnArray.push(obj)

                    return true;
                });

                if(itemSearchObj.runPaged().count == 0) return 'No NetSuite Items found';


                log.debug('returning:', JSON.stringify(returnArray));
                return JSON.stringify(returnArray);


            }catch(e){
                log.error(e.name, e.message);
            }

        }

        return {
            'get': doGet,
        };


    });