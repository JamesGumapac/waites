/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 *
 * Given an array of objects of Quotes create the proper Quotes in NetSuite
 *
 */
define(['N/search','N/record'],
    function(search,record) {
        /**
         * Function called upon sending a GET request to the RESTlet.
         *
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
         * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
         * @since 2015.1
         */
        function doPost(postBody) {

            try{
				log.debug('Starting doPost')
                //example payload
                examplePayload =
                    {
                        "quotes":
                            [
                                {
									"netSuiteCustomerId": 3046,
                                    "probability": 5,
                                    "memo": "Testing Quote Endpoint",
                                    "shipToAddress": {
										"id": 182,
                                        "personName": "Bob Smith",
                                        "street": "1234 Main St",
                                        "street2": "Apt 50",
                                        "city": "Denver",
                                        "state": "CO",
                                        "postal": "80212",
                                        "countryCode": "US"
                                    },
                                    "billToAddress": {
										"id": 183,
                                        "companyName": "Amazon",
                                        "street": "9876 Main St",
                                        "street2": "Suite 300",
                                        "city": "Seattle",
                                        "state": "WA",
                                        "postal": "98106",
                                        "countryCode": "US"
                                    },
                                    "shipToContact": {
                                        "firstName": "Bob",
                                        "lastName":"Smith",
                                        "email": "testing@testing.com",
                                        "phone": "3135679632"
                                    },                                    
                                    "shipMethod":  "UPS",
                                    "orderLineDetails": [
                                        {"itemid": "1234", "quantity": "1", "price": "99"},
                                        {"itemid": "3456", "quantity": "3", "price": "19"},
                                        {"itemid": "6789", "quantity": "4", "price": "12"}
                                    ]
								}
							]
					}//end example payload
					
					//OPEN QUESTIONS :  Do we use an internal id reference for the BILL TO and SHIP TO address???


            var quoteArray = postBody.quotes;
            if(!quoteArray) return 'No quotes found';
			
            log.debug('quoteArray is:', quoteArray);
			
			var createdQuotesArray = [];

            //create the SALES ORDER records
            for(var i = 0; i < quoteArray.length; i++){
/**
                    //skip if no shipToAddress address information
                    if(!quoteArray[i].shipToAddress.id && !quoteArray[i].shipToAddress.personName){ 
					createdQuotesArray.push({'error': 'Unable to create Quote at index '+ i +' no PERSONNAME provided'})
						continue;
					}
										
					if(!quoteArray[i].shipToAddress.id && !quoteArray[i].shipToAddress.street) { 
						createdQuotesArray.push({'error': 'Unable to create Quote at index '+ i +' no STREET provided'})
						continue;
					} 
											
					if(!quoteArray[i].shipToAddress.id && !quoteArray[i].shipToAddress.city) { 
						createdQuotesArray.push({'error': 'Unable to create Quote at index '+ i +' no CITY provided'})
						continue;
					}
											
					if(!quoteArray[i].shipToAddress.id && !quoteArray[i].shipToAddress.state) { 
						createdQuotesArray.push({'error': 'Unable to create Quote at index '+ i +' no STATE provided'})
						continue;
					} 
											
					if(!quoteArray[i].shipToAddress.id && !quoteArray[i].shipToAddress.postal){ 
						createdQuotesArray.push({'error': 'Unable to create Quote at index '+ i +' no POSTAL provided'})
						continue;
					}
**/
					//skip if no netSuiteCustomerId value
                    if(!quoteArray[i].netSuiteCustomerId){
						createdQuotesArray.push({'error': 'Unable to create Quote at index '+ i +' no NETSUITECUSTOMERID provided'})
						continue;  
					}
										
                    var netSuiteCustomerId = quoteArray[i].netSuiteCustomerId;

                    var quoteRec = record.create({
                        type: record.Type.ESTIMATE,
                        isDynamic: true,
                        defaultValues: {
                            entity: netSuiteCustomerId
                        }
                    });

									
					//set SHIPMETHOD according to text name received in payload
					var shipMethodId = 0;
					if(quoteArray[i].shipMethod && quoteArray[i].shipMethod != null && quoteArray[i].shipMethod != 'undefined'){
/**						
						var shipMethodId = findShipmentMethodByTextName(quoteArray[i].shipMethod);
						log.debug('shipMethodId is:', shipMethodId)
						
						if(shipMethodId != 0 && shipMethodId != 'undefined' && shipMethodId !=  null){
							
							if(shipMethodId.indexOf('UPS') > -1){
								
								quoteRec.setValue({fieldId: 'shipcarrier', value: 'ups'})
								log.debug('Set SHIPCARRIER to UPS')
								
							}
							else{
								
								quoteRec.setValue({fieldId: 'shipcarrier', value: 'nonups'})
								quoteRec.setValue({fieldId: 'shipmethod', value: shipMethodId})
								log.debug('Set SHIPCARRIER to NONUPS')
								
							}
							
							
						}
						else{
							createdQuotesArray.push({'error': 'Incorrect SHIPMETHOD specified at index '+ i})
							continue;
									
						}
**/
					}

                    //set new SHIP TO address
					if(quoteArray[i].shipToAddress.id.length > 0 && quoteArray[i].shipToAddress.id && quoteArray[i].shipToAddress.id != 0){
						
						quoteRec.setValue({fieldId: 'shipaddresslist', value: quoteArray[i].shipToAddress.id})	
						
					}
					else{
						var shipToAddress = quoteRec.getSubrecord({fieldId: 'shippingaddress'});
						shipToAddress.setValue({fieldId: 'country', value: quoteArray[i].shipToAddress.countryCode});
						shipToAddress.setValue({fieldId: 'city', value: quoteArray[i].shipToAddress.city});
						shipToAddress.setValue({fieldId: 'state', value: quoteArray[i].shipToAddress.state});
						shipToAddress.setValue({fieldId: 'zip', value: quoteArray[i].shipToAddress.postal});
						shipToAddress.setValue({fieldId: 'addressee', value: quoteArray[i].shipToAddress.personName});
						shipToAddress.setValue({fieldId: 'addr1', value: quoteArray[i].shipToAddress.street});
						shipToAddress.setValue({fieldId: 'addr2', value: quoteArray[i].shipToAddress.street2});
					}
					
					//set new SHIP TO address
					if(quoteArray[i].billToAddress.id.length > 0 && quoteArray[i].billToAddress.id != 0){
						
						quoteRec.setValue({fieldId: 'billaddresslist', value: quoteArray[i].billToAddress.id})	
						
					}
					//else native NetSuite will use DEFAULT BILL ADDRESS

                    //loop through orderLineDetails
                    for(var d = 0; d < quoteArray[i].orderLineDetails.length; d++) {

                        quoteRec.selectNewLine({sublistId: 'item', fieldId: 'item'})
                        quoteRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            value: quoteArray[i].orderLineDetails[d].itemid
                        })
                        quoteRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            value: quoteArray[i].orderLineDetails[d].quantity
                        })
                        quoteRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            value: 0  //hardcode to zero since this is SO shipped to fan
                        })
						
						quoteRec.commitLine({sublistId: 'item'})

                    }
					//set associated OPPORTUNITY
					//quoteRec.setValue({fieldId: 'opportunity', value: quoteArray[i].netSuiteOpportunityId})
					
                    var quoteRecId = quoteRec.save({enableSourcing: true, ignoreMandatoryFields: true});
                    createdQuotesArray.push({'netSuiteQuoteId': quoteRecId});
					
	
				
			}//end for loop of all Quote objects provided

                log.debug('Finished script, createdQuotesArray is:', createdQuotesArray);
				//return the repsonse for each element of the array
                return createdQuotesArray;

            }catch(e){
                log.error(e.name, e.message);
				return e.name +' / '+ e.message;
            }

			
			function findShipmentMethodByTextName(shipmethodname){
				
				SHIPMENT_METHOD_ID = 0; 
				
				var shipitemSearchObj = search.create({
				   type: "shipitem",
				   filters:
				   [
					  ["formulanumeric: CASE UPPER('" + shipmethodname +"') WHEN UPPER({itemid}) THEN 1 ELSE 0 END","equalto","1"]
				   ],
				   columns:
				   [
				   ]
				});
				var searchResultCount = shipitemSearchObj.runPaged().count;
				log.debug("shipitemSearchObj result count",searchResultCount);
				shipitemSearchObj.run().each(function(result){
				  
				   SHIPMENT_METHOD_ID = result.id;
				  
				   return true;
				});
				
				return SHIPMENT_METHOD_ID;
				
			}
			

        }

        return {
            'post': doPost,
        };


    });