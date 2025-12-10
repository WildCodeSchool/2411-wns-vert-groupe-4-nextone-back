import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Express, Request, Response } from "express";
import ManagerService from "@/services/manager.service";
import CompanyService from "@/services/company.service";

const authorizedCorsUrls = [  
    "http://localhost:4000",
  "https://david4.wns.wilders.dev",
  "https://staging.david4.wns.wilders.dev"];

export default function uploadImage(app: Express) {
    app.use("/images/managers/:id/profile-picture", cors({
        origin: function (origin, callback) {
            if (!origin || authorizedCorsUrls.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error("CORS not allowed"));
            }
        },
        credentials: true,
    }));

    app.use("/images/companies/:id/logo", cors({
        origin: function (origin, callback) {
            if (!origin || authorizedCorsUrls.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error("CORS not allowed"));
            }
        },
        credentials: true,
    }));

    const storage = multer.diskStorage({
        destination: function (_, __, cb) {
            cb(null, path.join(process.cwd(), "src/uploads"));
        },
        filename: function (_, file, cb) {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
        },
    });

    const upload = multer({ storage: storage });

    app.put("/images/managers/:id/profile-picture", upload.single("file"), (req: Request, res: Response) => {
        fs.readFile(`${req.file?.path}`, (err) => {
            if (err) {
                res.status(500).json({ error: err });
            } else {
                const managerId = req.params.id
                const managerService = new ManagerService();
                managerService.updateManager(managerId, { profileImage: req.file?.filename})
                res.status(201).json({ status: "success", filename: `/images/files/${req.file?.filename}` });
            }
        });
    });

    app.put("/images/companies/:id/logo", upload.single("file"), (req: Request, res: Response) => {
        fs.readFile(`${req.file?.path}`, (err) => {
            if (err) {
                res.status(500).json({ error: err });
            } else {
                const companyId = req.params.id
                const companyService = CompanyService.getService();
                companyService.updateCompany(companyId, { logoCompany: req.file?.filename})
                res.status(201).json({ status: "success", filename: `/images/files/${req.file?.filename}` });
            }
        });
    });

    app.get("/images/files/:filename", (req, res) => {
        const file = path.join(process.cwd(), "src/uploads", req.params.filename);
        fs.readFile(file, (err, data) => {
            if (err) {
                res.writeHead(404, { "Content-Type": "text" });
                res.write("Le fichier n'a pas été trouvé");
                res.end();
            } else {
                res.writeHead(200, { "Content-Type": "application/octet-stream" });
                res.write(data);
                res.end();
            }
        });
    });
}