import { deleteFile } from "../controllers/file.controllers";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = express.Router();


router.delete("/:id",verifyJWT, deleteFile);
router.patch("/:id",verifyJWT, updateFile);

export default router;