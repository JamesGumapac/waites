/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/runtime', 'N/search', 'N/file'],
    /**
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 * @param{file} file
 */
    (record, runtime, search, file) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            let { request, response } = scriptContext
            let params = request.parameters
            let rec = params.id?JSON.stringify(record.load({
                type: 'itemfulfillment',
                id: params.id
            })):'{}'

            file.create({
                name: 'sample.txt',
                fileType: file.Type.PLAINTEXT,
                contents: rec,
                folder: -15
            }).save()

            response.write(rec)
        }

        return {onRequest}

    });
