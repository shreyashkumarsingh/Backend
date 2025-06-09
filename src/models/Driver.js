/**
 * driver.model.js
 * ──────────────────────────────────────────────────────────
 * Pure stand-alone representation of driver_tbl
 */
module.exports = (sequelize, DataTypes) => {
  const Driver = sequelize.define(
    'Driver',
    {
      d_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      license_no: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      d_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      v_owner_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      v_org_name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      v_org_id: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      d_status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'active'
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true // Optional address field
      }
    },
    {
      tableName: 'driver_tbl',
      timestamps: false
    }
  );

  /**
   * Optional helper for stripping any private columns
   * before sending a response.
   */
  Driver.prototype.toSafeObject = function () {
    const { ...safeDriver } = this.toJSON();
    return safeDriver;
  };

  // ⚠️ No Driver.associate() block — this model is independent.

  return Driver;
};
