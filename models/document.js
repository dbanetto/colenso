'use strict';
module.exports = function(sequelize, DataTypes) {
  var Document = sequelize.define('Document', {
    title: DataTypes.STRING,
    author: DataTypes.STRING,
    sourceDesc: DataTypes.TEXT,
    path: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Document;
};
