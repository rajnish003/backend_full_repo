const Device = require("../../models/Device");

// Add a new device
exports.addDevice = async (req, res) => {
  try {
    const { name, type, location, userId } = req.body;

    const device = new Device({ name, type, location, userId });
    await device.save();

    res.status(201).json({ message: "Device added successfully", device });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all devices for a user
exports.getDevicesByUser = async (req, res) => {
  try {
    const devices = await Device.find({ userId: req.params.userId });
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update device status (ON/OFF)
exports.updateDeviceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!device) return res.status(404).json({ message: "Device not found" });

    res.json(device);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete device
exports.deleteDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);

    if (!device) return res.status(404).json({ message: "Device not found" });

    res.json({ message: "Device removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
