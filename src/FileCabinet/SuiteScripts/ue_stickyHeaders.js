/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/ui/serverWidget'],
    /**
 * @param{serverWidget} serverWidget
 */
    (serverWidget) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            scriptContext.form.addField({
            id: 'custpage_stickyheaders_script',
            label: 'Hidden',
            type: serverWidget.FieldType.INLINEHTML
        }).defaultValue = '<script>' +
        	'(function($){' +
        	    '$(function($, undefined){' +
		        	'$(".uir-machine-table-container")' + // All NetSuite tables are wrapped in this CSS class
			        	'.css("max-height", "70vh")' +
			        	// Make header row sticky.
						'.bind("scroll", (event) => {' +
							'$(event.target).find(".uir-machine-headerrow > td,.uir-list-headerrow > td")' +
								'.css({' +
									'"transform": `translate(0, ${event.target.scrollTop}px)`,' +
									'"z-index": "9999",' + // See Note #1 below
									'"position": "relative"' +
								'});' +
						'})' +
						// Make floating action bar in edit mode sticky.
						'.bind("scroll", (event) => {' +
							'$(".machineButtonRow > table")' +
								'.css("transform", `translate(${event.target.scrollLeft}px)`);' +
						'});' +
        	    '});' +
        	'})(jQuery);' +
		'</script>';
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {

        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
