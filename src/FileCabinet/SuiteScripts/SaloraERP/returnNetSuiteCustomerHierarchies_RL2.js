/**
* @NApiVersion 2.x
* @NScriptType Restlet
* @NModuleScope SameAccount
*
* Return all Customers and their Subcustomers
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
    function doGet() {

       try{
		   log.debug('Starting doGet');

			// var customerSearchObj = search.create({
			//    type: "customer",
			//    filters:
			//    [
			// 	// search.createFilter({
			// 	// 	name: 'internalid',
			// 	// 	operator: 'anyof',
			// 	// 	values: [3055]
			// 	// })
			//    ],
			//    columns:
			//    [
			// 	search.createColumn({name: "subsidiarynohierarchy", label: "Primary Subsidiary (no hierarchy)"}),
			// 	search.createColumn({name: "internalid", label: "Internal ID"}),
			// 	search.createColumn({name: "entityid", sort: search.Sort.ASC, label: "ID"}),
			// 	  //search.createColumn({name: "altname", label: "Name"}),
			// 	search.createColumn({name: "email", label: "Email"}),
			// 	search.createColumn({name: "isperson", label: "Is Individual"}),
			// 	search.createColumn({name: "internalid", join: "subCustomer", label: "Internal ID"}),
			// 	search.createColumn({name: "entityid", join: "subCustomer", label: "ID"}),
			// 	search.createColumn({name: "altname", join: "subCustomer", label: "Name"}),
			// 	search.createColumn({name: "email", join: "subCustomer", label: "Email"}),
			// 	search.createColumn({name: "isperson", join: "subCustomer", label: "Is Individual"}),
			// 	search.createColumn({name: "addressinternalid", label: "Address ID"}),
				//  search.createColumn({
				// 	name: "addressee",
				// 	join: "Address",
				// 	label: "Addressee"
				//  }),
				//   search.createColumn({
				// 	name: "city",
				// 	join: "Address",
				// 	label: "City"
				//  }),
				//  search.createColumn({
				// 	name: "state",
				// 	join: "Address",
				// 	label: "State/Province"
				//  }),
				//  search.createColumn({
				// 	name: "zipcode",
				// 	join: "Address",
				// 	label: "Zip Code"
				//  }),
				//  search.createColumn({
				// 	name: "isdefaultbilling",
				// 	join: "Address",
				// 	label: "Default Billing Address"
				//  }),
				//  search.createColumn({
				// 	name: "isdefaultshipping",
				// 	join: "Address",
				// 	label: "Default Shipping Address"
				//  })
			//    ]
			// });

			var customerSearchObj = search.load({
				id: 'customsearch_serp_customer_rl_search'
			});

			// customerSearchObj.filters.push(search.createFilter({
			// 	name: 'internalid',
			// 	operator: 'anyof',
			// 	values: [30]
			// }));

			var searchResultCount = customerSearchObj.runPaged().count;
			log.debug('customerSearchObj searchResultCount is:', searchResultCount)
			if(searchResultCount == 0) return 'No NetSuite CUSTOMERS found';

			var returnArray = [];

			var results = customerSearchObj.run().getRange({start: 0, end: 50});
			log.debug("results",results);

			for(var i = 0; i < results.length; i++){

				parentObj = {};
				parentObj.internalId = results[i].id;
				parentObj.subsidiary = results[i].getValue({name: "subsidiarynohierarchy"});
				parentObj.customerId = results[i].getValue({name: "entityid"});
				parentObj.customerName = results[i].getValue({name: "altname"});
				// parentObj.clientName = results[i].getText({name: "entity"});

				//get the subcustomers
				log.debug('parentObj.internalId is:', parentObj.internalId);
				var childrenArr = getSubCustomers(parentObj.internalId);

				parentObj.children = childrenArr;

				//get the addresses
				var addressArr = getAddresses(parentObj.internalId);
				parentObj.addresses = addressArr;

				returnArray.push(parentObj)

			}

			log.debug('returning:', JSON.stringify(returnArray));
			return JSON.stringify(returnArray);


	   }catch(e){
		   log.error(e.name, e.message);
	   }

    }

	function getSubCustomers(parentId){

		try {

			var subCustomerSearchObj = search.create({
				type: "customer",
				filters:
				[
					["parentcustomer.internalid","anyof", [parentId]]
				],
				columns:
				[
					search.createColumn({name: "internalid", label: "internalid"}),
				]
				});

			var subCustomerSearchResultCount = subCustomerSearchObj.runPaged().count;
			log.debug('subCustomerSearchResultCount is:', subCustomerSearchResultCount);
			if(subCustomerSearchResultCount == 0) return;

			var subCustomerResults = subCustomerSearchObj.run().getRange({start: 0, end: 999});
			// log.debug("subCustomerResults",subCustomerResults);

			var childArr = [];

			for(var i = 0; i < subCustomerResults.length; i++){

				childInternalId = subCustomerResults[i].getValue({name: "internalid"});

				childArr.push(childInternalId);

			}

			return childArr;

		} catch (err) {
			log.error("getAddresses", err);
		}
	}

	function getAddresses(customerId){

		try {
			var customerRecord = record.load({
				type: 'customer',
				id: customerId
			});

			var addressesCount = customerRecord.getLineCount("addressbook");
			var arrAddresses = [];
			for (var i = 0; i < addressesCount; i++) {

				var addressId = customerRecord.getSublistValue({
					sublistId: "addressbook",
					fieldId: 'addressid',
					line: i
				});

				var subrec = customerRecord.getSublistSubrecord({
					sublistId: 'addressbook',
					fieldId: 'addressbookaddress',
					line: i
				});

				var addressee = customerRecord.getSublistValue({
					sublistId: "addressbook",
					fieldId: 'addressee',
					line: i
				});
				var addr1 = subrec.getValue({
					fieldId: 'addr1'
				});

				var addr2 = subrec.getValue({
					fieldId: 'addr2'
				});

				var city = subrec.getValue({
					fieldId: 'city'
				});

				var state = subrec.getValue({
					fieldId: 'state'
				});

				var zip = subrec.getValue({
					fieldId: 'zip'
				});

				arrAddresses.push({
					'addressId': addressId,
					'addressee': addressee,
					'street1': addr1,
					'street2': addr2,
					'city': city,
					'state': state,
					'zip': zip
					});

			}

			return arrAddresses;

		}catch(err) {
			log.error("getAddresses", err);
		}
	}

	return {
		'get': doGet,
	};


});