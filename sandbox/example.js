//var stencils = stencil.define("div1");
//var table1 = stencil.define("table1");
//OR
var stencils = stencil.build();

stencils.div1.render([{
    title: 'MyDiv No. 1',
    list1: [{
        name: 'happy'
    }, {
        name: 'heyyyyy'
    }],
    list2: [{}, {}]
}, {
    title: 'MyDiv No. 2',
    list1: [{
        name: 'wah'
    }, {
        name: 'pek chek'
    }]
}, {
    title: 'MyDiv No. 3',
    list1: [{
        name: 'hahaha'
    }, {
        name: 'haizzz'
    }]
}]);


table1.render({
    row: [{
        cell: [{
            cellData: "1-1"
        }, {
            cellData: "1-2"
        }, {
            cellData: "1-3"
        }]
    }, {
        cell: [{
            cellData: "2-1"
        }, {
            cellData: "2-2"
        }, {
            cellData: "2-3"
        }]
    }]
});