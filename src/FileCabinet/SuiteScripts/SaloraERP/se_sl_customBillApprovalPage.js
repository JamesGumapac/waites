/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @NAuthor Jerome Morden
 */
define(['N/file', 'N/format', 'N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/url'],

	( file, format, record, runtime, search, ui, url ) => {
	   
		/**
		 * Definition of the Suitelet script trigger point.
		 *
		 * @param {Object} context
		 * @param {ServerRequest} context.request - Encapsulation of the incoming request
		 * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
		 * @Since 2015.2
		 */
		const onRequest = context => {
			var { request, response } = context;
			var params = request.parameters;

			// Get employee internalid
			var userId = getEmployeeId( params.eid || params.custpage_eid );

			if(params.custpage_action)
				approveRejectBill( context );

			if(params.pdf || params.files){
				printPdf(context);
				return;
			}

			var form = ui.createForm({
				title: 'Bill Approval'
			});

			var fieldGroup = form.addFieldGroup({
				id: 'custpage_fldgrp_primary',
				label: 'Primary Information'
			});

			var fields = {};
			([
				//['id', 'label', 'type', 'source', 'display'].
				['eid', 'TokenID', 'TEXT', 'HIDDEN'],
				['action', 'Action', 'TEXT', 'HIDDEN'],
				['reason', 'Reason', 'TEXT', 'HIDDEN'],
				['internalid', 'Internal ID', 'TEXT', 'HIDDEN'],
				['transactionnumber', 'Vendor Bill #', 'TEXT', 'INLINE'],
				['tranid', 'Reference No.', 'TEXT', 'INLINE'],
				['entity', 'Vendor', 'TEXT', 'INLINE'],
				['trandate', 'Date', 'DATE', 'INLINE'],
				['duedate', 'Due Date', 'DATE', 'INLINE'],
				['postingperiod', 'Posting Period', 'TEXT', 'INLINE'],
				['subsidiary', 'Subsidiary', 'TEXT', 'INLINE'],
				['account', 'Account', 'TEXT', 'INLINE'],
				['approvalstatus', 'Approval Status', 'TEXT', 'INLINE'],
				['memo', 'Memo', 'LONGTEXT', 'INLINE'],
				['usertotal', 'Amount', 'CURRENCY', 'INLINE'],
				['currency', 'Currency', 'TEXT', 'INLINE']
			]).forEach(fld=>{
				fields[fld[0]] = form.addField({
					id: `custpage_${fld[0]}`,
					label: fld[1],
					type: ui.FieldType[fld[2]],
					container: 'custpage_fldgrp_primary'
				});

				fields[fld[0]].updateDisplayType({
					displayType: ui.FieldDisplayType[ fld[3] ]
				});
			});

			var sublist = {
				expense: form.addSublist({
					id: 'custpage_sublist_expense',
					label: 'Expense',
					type: ui.SublistType.LIST
				}),
				item: form.addSublist({
					id: 'custpage_sublist_item',
					label: 'Item',
					type: ui.SublistType.LIST
				})
			};

			var sublistFields = {
				expense: {},
				item: {}
			};

			// Expense
			([
				//['id', 'label', 'type'],
				['account', 'Account', 'TEXT'],
				['amount', 'Amount', 'CURRENCY'],
				['department', 'Department', 'TEXT'],
				['class', 'Class', 'TEXT'],
				['project', 'Project', 'TEXT'],
				['location', 'Location', 'TEXT'],
				['memo', 'Memo', 'TEXTAREA'],
				['amortizstartdate', 'Amort. Start', 'DATE'],
				['amortizationenddate', 'Amort. End', 'DATE'],
			]).forEach(fld=>{
				sublistFields.expense[fld[0]] = sublist.expense.addField({
					id: `custcol_${fld[0]}`,
					label: fld[1],
					type: ui.FieldType[fld[2]],
				});

				sublistFields.expense[fld[0]].updateDisplayType({
					displayType: ui.FieldDisplayType.INLINE
				});
			});

			// Item
			([
				//['id', 'label', 'type'],
				['item', 'Item', 'TEXT'],
				['description', 'Description', 'TEXTAREA'],
				['department', 'Department', 'TEXT'],
				['class', 'Class', 'TEXT'],
				['location', 'Location', 'TEXT'],
				['rate', 'Rate', 'FLOAT'],
				['quantity', 'Quantity', 'FLOAT'],
				['amount', 'Amount', 'CURRENCY'],
				['amortizstartdate', 'Amort. Start', 'DATE'],
				['amortizationenddate', 'Amort. End', 'DATE'],
			]).forEach(fld=>{
				sublistFields.item[fld[0]] = sublist.item.addField({
					id: `custcol_${fld[0]}`,
					label: fld[1],
					type: ui.FieldType[fld[2]],
				});

				sublistFields.item[fld[0]].updateDisplayType({
					displayType: ui.FieldDisplayType.INLINE
				});
			});

			// Get list page url
			var script = runtime.getCurrentScript();
			var scriptId = script.getParameter('custscript_custapprbillpage_script');
			var deploymentId = script.getParameter('custscript_custapprbillpage_deployment');
			var slApprovalList = url.resolveScript({
				scriptId, deploymentId, returnExternalUrl: true,
				params: { eid: params.eid || params.custpage_eid }
			});

			// Add form buttons
			if(!params.custpage_action){
				form.addSubmitButton({ label: 'Approve' });
				form.addButton({ id: 'custpage_btn_reject', label: 'Reject', functionName: 'reject();' });
				form.addButton({ id: 'custpage_btn_cancel', label: 'Cancel', functionName: `backToList("${slApprovalList}");` });
			}else{
				form.addButton({ id: 'custpage_btn_backtolist',
					label: 'Back To List', functionName: `backToList("${slApprovalList}");` });
			}

			// Load vendor bill record
			var billRecord = record.load({
				type: 'vendorbill',
				id: params.rid || params.custpage_internalid
			});

			// Set mainline field values
			for(var fieldId in fields){
				var value = billRecord.getText({ fieldId }) || billRecord.getValue({ fieldId }) || '';

				if(fieldId == 'usertotal')
					value = billRecord.getValue({ fieldId });

				fields[fieldId].defaultValue = value;
			}

			var total = {  expense: 0, item: 0 }
			for(var sublistId in sublistFields){
				var lineCount = billRecord.getLineCount({ sublistId });

				for(var line=0; line<lineCount; line++){
					for(var fieldId in sublistFields[sublistId]){
						var value = billRecord.getSublistText({
							sublistId, fieldId, line
						}) || billRecord.getSublistValue({
							sublistId, fieldId, line
						}) || '';

						if( fieldId.match(/date/gi) && value )
							value = format.format({ type: format.Type.DATE, value });
						else if(fieldId.match(/amount/gi))
							value = billRecord.getSublistValue({
								sublistId, fieldId, line
							});
log.debug(fieldId, value);

						if(value)
							sublist[sublistId].setSublistValue({
								id: `custcol_${fieldId}`,
								line, value
							});
					}
				}
			}

			// Attachments
			var files = [];
			search.create({
				type: 'vendorbill',
				filters: [
					['mainline', 'is', 'T'], 'AND',
					['file.created', 'isnotempty', ''], 'AND',
					['internalid', 'anyof', params.rid || params.custpage_internalid]
				],
				columns: [{ name: 'internalid', join: 'file' }]
			}).run().getRange(0,1000).forEach(res=>{
				files.push( res.getValue(res.columns[0]) );
			});

			if(files.length){
				var attachmentUrl = url.resolveScript({
					scriptId: script.id,
					deploymentId: script.deploymentId,
					returnExternalUrl: true,
					params: {
						rid: params.rid || params.custpage_internalid,
						eid: params.eid || params.custpage_eid,
						fileid: files.length < 2? files[0]: '',
						files: 'T'
					}
				});
				form.addButton({
					id: 'custpage_attachments',
					label: 'Attachment' + (files.length > 1? 's': ''),
					functionName: `printPdf("${attachmentUrl}")`
				});
			}

			fields.eid.defaultValue = params.eid || params.custpage_eid;
			fields.action.defaultValue = params.custpage_action || '';
			fields.internalid.defaultValue = billRecord.id;

			form.clientScriptModulePath = `./se_cs_customBillApprovalPage.js`;

			response.writePage(form);
		}

		const printPdf = context => {
			var { request, response } = context;
			var params = request.parameters;

			var attachedFile = '';

			if(params.fileid)
				attachedFile = file.load({ id: params.fileid });
			else if(params.files){
				multipleFiles( context );
				return;
			}else
				attachedFile = render.transaction({
					entityId: parseInt(params.rid),
					printMode: render.PrintMode.PDF
				});

			response.writeFile( attachedFile, true );
		}

		const approveRejectBill = context => {
			var { request } = context;
			var params = request.parameters;
/*
			var values = { custbody_salora_extapprovalaction: params.custpage_action };
			if(params.custpage_action == 'reject'){
				values.custbody_salora_rejectedreason = params.custpage_reason;
			}
*/
			var billRec = record.load({
				type: 'vendorbill',
				id: params.custpage_internalid,
			});
			billRec.setValue({
				fieldId: 'custbody_salora_extapprovalaction',
				value: params.custpage_action
			});
			if(params.custpage_reason)
				billRec.setValue({
					fieldId: 'custbody_apsl_rejection_reason',
					value: params.custpage_reason
				});

			billRec.save();
		}

		const getEmployeeId = token => {
			if(!token)
				throw('Invalid URL.');

			let employeeId = '';
			search.create({
				type: 'employee',
				filters: [['custentity_salora_tokenid', 'is', token]]
			}).run().getRange(0,1).forEach(res=>{
				employeeId = res.id;
			});

			if(!employeeId)
				throw('Invalid URL.');

			return employeeId;
		}

		return {
			onRequest
		};
		
	});
