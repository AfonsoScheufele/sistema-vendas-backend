const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Cliente = require("./Cliente");

const Venda = sequelize.define("Venda", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  total: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
  criadoEm: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

Venda.belongsTo(Cliente, { foreignKey: "clienteId" });

module.exports = Venda;
