//node框架
var express = require('express')
var router = express.Router()
    //数据库
var mongoose = require('mongoose')
    //comment集合
var vueCliInfo = require('../models/vueCliInfo')
    //引入mongodb
var MongoClient = require('mongodb').MongoClient;


//引入自动增长函数
var getNextSequenceValue = require('../public/javascripts/getNextSequenceValue')
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, {
    useNewUrlParser: true
}, function(err, db) {
    //获取到单个vueCli文章详情   查
    router.get('/:id', async(req, res) => {
        //数据库中查找所有数据,vueCliInfo集合查找
        let id = parseInt(req.params.id);
        console.log(id);
        if (err) throw err;
        //获取数据库
        var dbo = db.db("publicBlog");
        //操作数据库中的集合
        dbo.collection("vueCliInfo").find({
            "_id": id
        }).toArray(function(err, data) { // 返回集合中所有数据
            if (err) throw err;
            console.log(data);
            res.json({
                    data:data[0]
                })
                // db.close();
        });
    })

    //添加到所有文章详情   增
    router.post('/', async (req, res) => {
        //数据库中查找所有数据,vueCliInfo集合查找
        if (err) throw err;
        var dbo = db.db("publicBlog");

        //查询自增前的vueCliInfoid的counters
        var data = await dbo.collection("counters").find({
            _id: "vueCliInfoid"
        }).toArray();
        var sequence_value = data[0].sequence_value;

        //自增函数
        req.body["_id"] = await getNextSequenceValue("vueCliInfoid", db.db("publicBlog"));

        if (req.body["_id"] != sequence_value) {
            //自动添加last信息
            req.body["lastId"] = parseInt(req.body["_id"] - 1);
            const data = await dbo.collection("vueCliInfo").find({
                _id: req.body["lastId"]
            }).toArray();
            req.body.lastTittle = data[0].tittle;

            dbo.collection("vueCliInfo").insertOne(req.body, function (err, data) {
                if (err) throw err;
                console.log("文档插入成功");
                // db.close();
            });


            res.json({
                "status": 202,
                "msg": "恭喜你,成功了!"
            })
        } else {
            //自动添加last信息
            req.body["lastId"] = parseInt(req.body["_id"] - 1);
            const data = await dbo.collection("vueCliInfo").find({
                _id: req.body["lastId"]
            }).toArray();
            req.body.lastTittle = data[0].tittle;

            req.body["_id"] = parseInt(req.body["_id"] + 1);
            dbo.collection("vueCliInfo").insertOne(req.body, function (err, data) {
                if (err) throw err;
                console.log("文档插入成功");
                console.log(req.body);
                // db.close();
            });

            res.json({
                "status": 202,
                "msg": "恭喜你,成功了!"
            })
        }

    })

    //删除文章    删
    router.delete('/:id', async(req, res) => {
        //数据库中查找所有数据,vueCliInfo集合查找
        let id = parseInt(req.params.id);
        if (err) throw err;
        //获取数据库
        var dbo = db.db("publicBlog");
        //操作数据库中的集合
        dbo.collection("vueCliInfo").deleteOne({
            "_id": id
        },function(err,obj){
            if (err) throw err;
            // console.log("文档删除成功");
            // db.close();
            res.json({
                data:{
                    status:202,
                    msg:"成功删除!"
                }
            })
        })
    })
});



module.exports = router;