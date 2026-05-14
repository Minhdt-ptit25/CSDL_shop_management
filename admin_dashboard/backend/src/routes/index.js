const { Router } = require("express");

const authRouter      = require("./auth");
const statsRouter     = require("./stats");
const reportsRouter   = require("./reports");
const productsRouter  = require("./products");
const customersRouter = require("./customers");
const ordersRouter    = require("./orders");
const employeesRouter = require("./employees");
const suppliersRouter = require("./suppliers");
const skusRouter      = require("./skus");
const vouchersRouter  = require("./vouchers");

const router = Router();

router.get("/", (_req, res) => res.json({ ok: true, version: "v1" }));

router.use("/",          authRouter);
router.use("/stats",     statsRouter);
router.use("/report",    reportsRouter);
router.use("/products",  productsRouter);
router.use("/customers", customersRouter);
router.use("/orders",    ordersRouter);
router.use("/employees", employeesRouter);
router.use("/suppliers", suppliersRouter);
router.use("/skus",      skusRouter);
router.use("/vouchers",  vouchersRouter);

module.exports = router;
