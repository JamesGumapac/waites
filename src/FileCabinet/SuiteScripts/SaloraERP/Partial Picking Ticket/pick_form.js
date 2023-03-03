define(["N/ui/serverWidget"], function(serverWidget) {
    const _form = {
        title: "Partial Pick Ticket",
        clientScriptModulePath: "./cs_pick.js",
        hideNavBar: true,
    };

    const _buttons = [{
        id: "custpage_print",
        label: "Print",
        issubmitbutton: true,
    }, ];

    const _body = [{
            id: "custpage_tranid",
            label: "Document Number",
            type: serverWidget.FieldType.SELECT,
            source: "transaction",
            displayType: serverWidget.FieldDisplayType.INLINE,
        },
        {
            id: "custpage_trantype",
            label: "Type",
            type: serverWidget.FieldType.TEXT,
            displayType: serverWidget.FieldDisplayType.INLINE,
        },
        {
            id: "custpage_trandate",
            label: "Date",
            type: serverWidget.FieldType.DATE,
            displayType: serverWidget.FieldDisplayType.INLINE,
        },
    ];

    const _sublist = {
        id: "custpage_items",
        type: serverWidget.SublistType.LIST,
        label: "Items",
        columns: [{
                id: "custpage_line",
                type: serverWidget.FieldType.INTEGER,
                label: "Line",
                displayType: serverWidget.FieldDisplayType.INLINE,
            },{
                id: "custpage_item",
                type: serverWidget.FieldType.SELECT,
                source: "item",
                label: "Item",
                displayType: serverWidget.FieldDisplayType.INLINE,
            },
            {
                id: "custpage_quantity",
                type: serverWidget.FieldType.FLOAT,
                label: "Quantity",
                displayType: serverWidget.FieldDisplayType.INLINE,
            },
            {
                id: "custpage_quantitycommitted",
                type: serverWidget.FieldType.FLOAT,
                label: "Committed",
                displayType: serverWidget.FieldDisplayType.INLINE,
            },
            {
                id: "custpage_quantityfulfilled",
                type: serverWidget.FieldType.FLOAT,
                label: "Fulfilled",
                displayType: serverWidget.FieldDisplayType.INLINE,
            },
            {
                id: "custpage_quantityreceived",
                type: serverWidget.FieldType.FLOAT,
                label: "Received",
                displayType: serverWidget.FieldDisplayType.INLINE,
            },
            {
                id: "custpage_quantitybackordered",
                type: serverWidget.FieldType.FLOAT,
                label: "Back Ordered",
                displayType: serverWidget.FieldDisplayType.INLINE,
            },
            {
                id: "custpage_remainingquantity",
                type: serverWidget.FieldType.FLOAT,
                label: "Remaining Qty",
                displayType: serverWidget.FieldDisplayType.INLINE,
            },
            {
                id: "custpage_partialpickedqty",
                type: serverWidget.FieldType.FLOAT,
                label: "Partial Pick Qty",
                displayType: serverWidget.FieldDisplayType.ENTRY,
            },
        ],
    };

    function createForm() {
        return serverWidget.createForm(_form);
    }

    function createBody(form) {
        for (var i = 0; i < _body.length; i++) {
            var fld = form.addField(_body[i]);
            if (fld && _body[i].breakType) {
                fld.updateBreakType({
                    breakType: _body[i].breakType,
                });
            }
            if (fld && _body[i].displayType) {
                fld.updateDisplayType({
                    displayType: _body[i].displayType,
                });
            }
            if (fld && _body[i].defaultValue) {
                fld.defaultValue = _body[i].defaultValue;
            }
            if (fld && _body[i].layoutType) {
                fld.updateLayoutType({
                    layoutType: _body[i].layoutType,
                });
            }
            if (fld && _body[i].isMandatory) {
                fld.isMandatory = _body[i].isMandatory;
            }
        }
    }

    function createSublist(form) {
        var sublist = form.addSublist(_sublist);
        if (_sublist.addMarkAllButton) {
            sublist.addMarkAllButtons();
        }
        if (_sublist.columns) {
            for (var i = 0; i < _sublist.columns.length; i++) {
                var column = _sublist.columns[i];
                var sublistFld = sublist.addField(column);
                if (column.displayType) {
                    sublistFld.updateDisplayType({
                        displayType: column.displayType,
                    });
                }
                if (column.defaultValue) {
                    sublistFld.defaultValue = column.defaultValue;
                }
                if (column.isMandatory) {
                    sublistFld.isMandatory = column.isMandatory;
                }
            }
        }
        if (_sublist.buttons) {
            for (var i = 0; i < _sublist.buttons.length; i++) {
                var button = _sublist.buttons[i];
                sublist.addButton(button);
            }
        }
        return sublist;
    }

    function createButtons(form) {
        for (var i = 0; i < _buttons.length; i++) {
            var button = _buttons[i];
            if (button.issubmitbutton) {
                form.addSubmitButton({
                    label: "Print",
                });
            } else {
                form.addButton(button);
            }
        }
    }

    return {
        render: function() {
            let form = createForm();
            createBody(form);
            createSublist(form);
            createButtons(form);
            if (_form.clientScriptModulePath) form.clientScriptModulePath = _form.clientScriptModulePath;
            return form;
        },
    };
});