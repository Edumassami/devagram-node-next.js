import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import type { NextApiRequest, NextApiResponse } from "next";
 
const usuarioEndpoint = (req : NextApiRequest, res : NextApiResponse) => {
    return res.status(200).json('Usuário autenticado com sucesso');
}

export default validarTokenJWT(usuarioEndpoint);