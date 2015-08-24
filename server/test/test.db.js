var expect = require("chai").expect;

var db = require('monk')('mongodb://localhost:27017/sentinel');

describe("Database [Camera]", function() {
    it("should find camera with id cam1", function() {

        var cameras = db.get('camera');

        cameras.find({
            name: 'cam1'
        }).on('success', function(doc) {
         
            expect(doc[0].name).to.equal('cam1');

        });

    });
});