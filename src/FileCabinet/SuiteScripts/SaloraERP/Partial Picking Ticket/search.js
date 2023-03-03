define(["N/search", "N/log"], function(search, log) {
    function searchAll(type, filters, columns) {
        var runSearch = search
            .create({
                type: type,
                filters: filters,
                columns: columns,
            })
            .run();

        log.audit("Class Debug: searchAll", "type: " + type);
        log.audit("Class Debug: searchAll", "filters: " + JSON.stringify(filters));
        log.audit("Class Debug: searchAll", "columns: " + JSON.stringify(columns));
        return getResults(runSearch) || [];
    }

    function getRunSearch(id, filters, columns, type, clearFilters) {
        var searchObj = search.load({
            id: id,
            type: type,
        });

        var searchFilter = clearFilters ? null : searchObj.filters;

        if (searchFilter && searchFilter.length > 0) {
            if (filters) {
                for (var i = 0; i < searchFilter.length; i++) {
                    filters.push(searchFilter[i]);
                }
            }
        }

        if (filters) {
            searchObj.filters = filters;
        }

        log.debug("Run Search Filters", searchObj.filters);

        if (columns) {
            searchObj.columns = columns;
        }

        return searchObj.run();
    }

    function load(id, filters, columns) {
        var runSearch = getRunSearch(id, filters, columns);
        return runSearch.getRange(0, 1000) || [];
    }

    function loadAll(type, id, filters, columns, clearFilters) {
        var runSearch = getRunSearch(id, filters, columns, type, clearFilters);
        log.audit("Class Debug: loadAll", "type: " + type);
        log.audit("Class Debug: loadAll", "filters: " + JSON.stringify(filters));
        log.audit("Class Debug: loadAll", "columns: " + JSON.stringify(columns));
        return getResults(runSearch) || [];
    }

    function partialLoad(id, filters, columns, type, start, end) {
        var runSearch = getRunSearch(id, filters, columns, type);
        return getSearchResult(runSearch, start, end);
    }

    function getSearchResult(runSearch, start, end) {
        return runSearch.getRange(start, end);
    }

    function getResults(runSearch) {
        var index = 0;
        var len = 1000;
        var resultSet = [];
        var results = [];

        if (runSearch) {
            do {
                log.debug("Partial Loading", "Start from " + index + " and ends " + (len < resultSet.length ? index + len : resultSet.length + index));
                var resultSet = getSearchResult(runSearch, index, index + len) || [];
                if (resultSet && resultSet.length > 0) {
                    results = results.concat(resultSet);
                }
                index = index + len;
            } while (resultSet && resultSet.length > 0);

            log.debug("Search Result", results.length);

            return results;
        }

        return null;
    }

    function getFieldValue(type, id, fields) {
        return search.lookupFields({
            type: type,
            id: id,
            columns: fields,
        });
    }

    function createColumn(obj) {
        return search.createColumn(obj);
    }

    function lookupFields(obj) {
        return search.lookupFields(obj);
    }

    var Sort = {
        DESC: "DESC",
        ASC: "ASC",
    };

    var Summary = {
        SUM: "SUM",
    };

    function getRecordIdsOnly(results) {
        var ids = [];
        for (var i = 0; i < results.length; i++) {
            if (ids.indexOf(results[i].id) < 0) {
                ids.push(results[i].id);
            }
        }
        return ids;
    }

    return {
        Sort: Sort,
        Summary: Summary,
        searchAll: searchAll,
        loadAll: loadAll,
        load: load,
        partialLoad: partialLoad,
        getFieldValue: getFieldValue,
        createColumn: createColumn,
        lookupFields: lookupFields,
        getRecordIdsOnly: getRecordIdsOnly,
    };
});