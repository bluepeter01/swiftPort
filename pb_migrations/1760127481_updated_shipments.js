/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_shipments001")

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1042062360",
    "max": 0,
    "min": 0,
    "name": "tracking_number",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "select2063623452",
    "maxSelect": 1,
    "name": "status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Pending",
      "In-transition",
      "Held by Customs",
      "Delivered"
    ]
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3286692833",
    "max": 0,
    "min": 0,
    "name": "current_location",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "json666529867",
    "maxSize": 0,
    "name": "history",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3740358174",
    "max": 0,
    "min": 0,
    "name": "origin",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1053179562",
    "max": 0,
    "min": 0,
    "name": "destination",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2714339541",
    "max": 0,
    "min": 0,
    "name": "sender_name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1533686328",
    "max": 0,
    "min": 0,
    "name": "receiver_name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1350272281",
    "max": 0,
    "min": 0,
    "name": "package_contents",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "number130897217",
    "max": null,
    "min": null,
    "name": "weight",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text511710106",
    "max": 0,
    "min": 0,
    "name": "payment_reason",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "number1251237913",
    "max": null,
    "min": null,
    "name": "amount_due",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "select1580793482",
    "maxSelect": 1,
    "name": "payment_status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Unpaid",
      "Paid"
    ]
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "hidden": false,
    "id": "file3739536822",
    "maxSelect": 99,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "package_images",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2234237754",
    "max": 0,
    "min": 0,
    "name": "receiver_phone",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(16, new Field({
    "exceptDomains": null,
    "hidden": false,
    "id": "email653666451",
    "name": "receiver_email",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "email"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_shipments001")

  // remove field
  collection.fields.removeById("text1042062360")

  // remove field
  collection.fields.removeById("select2063623452")

  // remove field
  collection.fields.removeById("text3286692833")

  // remove field
  collection.fields.removeById("json666529867")

  // remove field
  collection.fields.removeById("text3740358174")

  // remove field
  collection.fields.removeById("text1053179562")

  // remove field
  collection.fields.removeById("text2714339541")

  // remove field
  collection.fields.removeById("text1533686328")

  // remove field
  collection.fields.removeById("text1350272281")

  // remove field
  collection.fields.removeById("number130897217")

  // remove field
  collection.fields.removeById("text511710106")

  // remove field
  collection.fields.removeById("number1251237913")

  // remove field
  collection.fields.removeById("select1580793482")

  // remove field
  collection.fields.removeById("file3739536822")

  // remove field
  collection.fields.removeById("text2234237754")

  // remove field
  collection.fields.removeById("email653666451")

  return app.save(collection)
})
