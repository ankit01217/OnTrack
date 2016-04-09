(function() {


    var brandsDS = {


        loadData: function(filter) {
            return $.grep(this.brands, function(brand) {
                return (!filter.name || brand.name.toLowerCase().indexOf(filter.name.toLowerCase()) > -1)
                    && (!filter.url || brand.url.toLowerCase().indexOf(filter.url) > -1)

            });
        },

        insertItem: function(insertingObj) {
            brandsDS.brands.push(insertingObj);

            var BrandsClass = Parse.Object.extend(Constans.BRANDS_COLLECTION_NAME);
            var newObj = new BrandsClass();
            for (key in insertingObj) {
                newObj.set(key, insertingObj[key]);
            }

            newObj.save(null, {
                success: function(newObj) {
                    //reload view now
                    window.loadParseBrands();
                }
            });


        },

        updateItem: function(updatingObj) {
            if(updatingObj.objectId != undefined)
            {
                var BrandsClass = Parse.Object.extend(Constans.BRANDS_COLLECTION_NAME);
                var query = new Parse.Query(BrandsClass);
                query.limit(Constans.MAX_QUERY_RESULT_LIMIT);

                query.get(updatingObj.objectId, {
                    success: function(parseObj) {
                        // The object was retrieved successfully.
                        for (key in updatingObj) {
                            parseObj.set(key, updatingObj[key]);

                        }

                        parseObj.save(null, {
                            success: function(newObj) {
                                //reload view now
                                window.loadParseBrands()
                            }
                        });


                    },
                    error: function(parseObj, error) {
                        // error is a Parse.Error with an error code and message.
                    }
                });

            }


        },

        deleteItem: function(deletingObj) {
            if(deletingObj.objectId != undefined) {
                var brandIndex = $.inArray(deletingObj, brandsDS.brands);
                brandsDS.brands.splice(brandIndex, 1);

                var BrandsClass = Parse.Object.extend(Constans.BRANDS_COLLECTION_NAME);
                var query = new Parse.Query(BrandsClass);
                query.limit(Constans.MAX_QUERY_RESULT_LIMIT);

                query.get(deletingObj.objectId, {
                    success: function (parseObj) {
                        // The object was retrieved successfully.
                        parseObj.destroy()

                    },
                    error: function (parseObj, error) {
                        alert('parse delete error')
                        // error is a Parse.Error with an error code and message.
                    }
                });

            }
        }

    };

    window.brandsDS = brandsDS;
    brandsDS.brands = [

    ];


    window.loadParseBrands = function(){
        var BrandsClass = Parse.Object.extend(Constans.BRANDS_COLLECTION_NAME);
        var query = new Parse.Query(BrandsClass);
        query.limit(Constans.MAX_QUERY_RESULT_LIMIT);
        query.find({
            success: function(results) {

                var st = JSON.stringify(results);
                var arr = JSON.parse(st);
                populateBrandsGrid(arr)
                $(".countLabel").text('Total:'+arr.length);
            },
            error: function(error) {
                alert("Error: " + error.code + " " + error.message);
            }
        });


    }


    function populateBrandsGrid(results){

        window.brandsDS.brands = results

        var d = $.Deferred();
        d.resolve(results)

        $("#brandsGrid").jsGrid({
            height: "auto",
            width: "100%",
            datatype: 'json',
            sorting: true,
            paging: true,
            pageSize:1000,
            autoload: true,
            filtering: true,
            editing: true,
            inserting:true,
            deleteConfirm: "Do you really want to delete this item?",

            data:results,
            controller: brandsDS,

            fields: [
                { type: "control" , width: 30 ,align: "center"},
                { name: "name", type: "text" ,width: 30 ,align: "center"},
                { name: "url", type: "text" ,width: 200 , css:"truncate",align: "center", cellRenderer:function(value, item) {

                    if(item.url != undefined)
                    {
                        return '<td><a class="error-deselect" href=\"'+item.url+'\" target="_blank">'+item.url+'</a></td>';
                    }

                }},

            ]
        });


    }






}());