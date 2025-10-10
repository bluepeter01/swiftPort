/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_shipments001")

  // add field
  collection.fields.addAt(17, new Field({
    "hidden": false,
    "id": "date2782280595",
    "max": "",
    "min": "",
    "name": "estimated_delivery",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_shipments001")

  // remove field
  collection.fields.removeById("date2782280595")

  return app.save(collection)
})
