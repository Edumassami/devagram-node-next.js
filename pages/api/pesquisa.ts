import { NextApiRequest, NextApiResponse } from "next";
import { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";
import { conectarMongoDB } from "../../middlewares/conectaMongoDB";
import { validarTokenJWT } from "../../middlewares/validarTokenJWT";
import { UsuarioModel } from "@/models/UsuarioModel";
import usuario from "./usuario";
import { politicaCORS } from "@/middlewares/politicaCORS";

const pesquisaEndpoint = 
    async(req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg | any[]>) => {
        try{
            if(req.method === 'GET'){

                if(req?.query?.id){
                    const usuarioEncontrado = await UsuarioModel.findById(req?.query?.id);
                    if(!usuarioEncontrado){
                        return res.status(400).json({erro : 'Usuário não encontrado'});
                    }
                    usuarioEncontrado.senha = null;
                    return res.status(200).json(usuarioEncontrado); 
                }else{

                const {filtro} = req.query;

                if(!filtro || filtro.length < 2){
                    return res.status(400).json({erro : 'Favor informar pelo menos 2 caracteres'});
                }

                const usuariosEncontrados = await UsuarioModel.find({
                    $or : [{nome : {$regex : filtro, $options : 'i'}},
                        {email : {$regex : filtro, $options : 'i'}}]
                });

                return res.status(200).json(usuariosEncontrados);
            }
            return res.status(400).json({erro : 'Método informado não é válido'});
        }
        }catch(e){
            console.log(e);
            return res.status(400).json({erro : 'Não foi possível buscar usuário'});
        }
    }

export default politicaCORS(validarTokenJWT(conectarMongoDB(pesquisaEndpoint)));