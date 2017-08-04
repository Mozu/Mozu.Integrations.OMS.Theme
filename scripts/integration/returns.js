function submitReturn(element) {
    require(['modules/jquery-mozu', 'modules/api'], function($, api) {
        element.disabled = true;
        var currentReturn = element.closest('.mz-orderlisting');
        var returnForms = $(currentReturn).find('.mz-returnform-field');
        var numReturnItems = returnForms.length;
        var returns = [];
        var quantityInput;
        var bundleComponents;
        var bundleComponent;
        var numBundleComponents;
        for (var i = 0; i < numReturnItems; i++) {
            quantityInput = $(returnForms[i]).find('input')[0];
            if (quantityInput.value > 0) {
                var orderItemIDs = quantityInput.getAttribute('orderItemID').split(',');
                var quantities = quantityInput.getAttribute('quantity').split(',');
                var shipmentIDs = quantityInput.getAttribute('shipmentID').split(',');
                var orderIDs = quantityInput.getAttribute('orderID').split(',');

                var value = quantityInput.value;
                var numShipments = shipmentIDs.length;
                bundleComponents = $(returnForms[i]).find('.bundle-component-info');
                numBundleComponents = bundleComponents.length;
                var returnedComponents = {};
                var orderItemID;
                var componentQuantityLeftToReturn;
                var componentQuantityToReturn;
                for (var k = 0; k < numShipments; k++) {
                    for (var n = 0; n < numBundleComponents; n++) {
                        bundleComponent = bundleComponents[n];
                        orderItemID = bundleComponent.getAttribute('orderItemID');
                        componentQuantityLeftToReturn = returnedComponents[orderItemID];
                        componentQuantityToReturn = bundleComponent.getAttribute('unitQuantity') * quantityInput.value;
                        if (componentQuantityLeftToReturn === undefined) {
                            if (componentQuantityToReturn <= bundleComponent.getAttribute('quantity')) {
                                returns.push({
                                    orderItemID: orderItemID,
                                    quantity: componentQuantityToReturn,
                                    shipmentID: bundleComponent.getAttribute('shipmentID'),
                                    orderID: bundleComponent.getAttribute('orderID')
                                });
                                returnedComponents[orderItemID] = 0;
                            } else {
                                returns.push({
                                    orderItemID: orderItemID,
                                    quantity: bundleComponent.getAttribute('quantity'),
                                    shipmentID: bundleComponent.getAttribute('shipmentID'),
                                    orderID: bundleComponent.getAttribute('orderID')
                                });
                                returnedComponents[orderItemID] = componentQuantityToReturn - bundleComponent.getAttribute('quantity');
                            }
                        } else if (componentQuantityLeftToReturn> 0) {
                            if (componentQuantityLeftToReturn <= bundleComponent.getAttribute('quantity')) {
                                returns.push({
                                    orderItemID: orderItemID,
                                    quantity: componentQuantityLeftToReturn,
                                    shipmentID: bundleComponent.getAttribute('shipmentID'),
                                    orderID: bundleComponent.getAttribute('orderID')
                                });
                                returnedComponents[orderItemID] = 0;
                            } else {
                                returns.push({
                                    orderItemID: orderItemID,
                                    quantity: bundleComponent.getAttribute('quantity'),
                                    shipmentID: bundleComponent.getAttribute('shipmentID'),
                                    orderID: bundleComponent.getAttribute('orderID')
                                });
                                returnedComponents[orderItemID] = componentQuantityLeftToReturn - bundleComponent.getAttribute('quantity');
                            }
                        }
                    }

                    if (value <= quantities[k]) {
                        returns.push({
                            orderItemID: orderItemIDs[k],
                            quantity: value,
                            shipmentID: shipmentIDs[k],
                            orderID: orderIDs[k]
                        });
                    } else {
                        returns.push({
                            orderItemID: orderItemIDs[k],
                            quantity: quantities[k],
                            shipmentID: shipmentIDs[k],
                            orderID: orderIDs[k]
                        });
                        value -= quantities[k];
                    }
                }
            }
        }

        api.request('POST', 'oms/return', {
            returns: returns
        }).then(function(response) {
            if (response.message === 'success') {
                window.location.reload(true);
            }
            element.disabled = false;
        },function() {
            element.disabled = false;
        });
    });
}
