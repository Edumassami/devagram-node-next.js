import { NextApiRequest, NextApiResponse } from "next";
import { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";
import { validarTokenJWT } from "../../middlewares/validarTokenJWT";
import { conectarMongoDB } from "../../middlewares/conectaMongoDB";
import { UsuarioModel } from "../../models/UsuarioModel";
import { SeguidorModel } from "../../models/SeguidorModel";
import { politicaCORS } from "@/middlewares/politicaCORS";

const seguirEndpoint = async(req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg>) => {
    try{

        if(req.method === 'PUT'){

            const {userId, id} = req?.query;

            const usuarioLogado = await UsuarioModel.findById(userId);
            if(!usuarioLogado){
                return res.status(400).json({erro : 'Usuário logado não encontrado'});
            }

            const usuarioASerSeguido = await UsuarioModel.findById(id);
            if(!id){
                return res.status(400).json({erro : 'Usuário a ser seguido não encontrado'});
            }
            
            const euJaSigoEsseUsuario = await SeguidorModel
                .find({usuarioId : usuarioLogado._id, usuarioSeguidoId : usuarioASerSeguido._id});
            if(euJaSigoEsseUsuario && euJaSigoEsseUsuario.length > 0){

                euJaSigoEsseUsuario.forEach(async(e : any) => await SeguidorModel.findByIdAndDelete({_id : e._id}));
                
                usuarioLogado.seguindo--;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);

                usuarioASerSeguido.seguidores--;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido);

                return res.status(200).json({msg : 'Deixou de seguir o usuário com sucesso'});

            } else{

                const seguidor = {
                    usuarioId : usuarioLogado._id,
                    usuarioSeguidoId : usuarioASerSeguido._id
                };
                await SeguidorModel.create(seguidor);

                usuarioLogado.seguindo++;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);

                usuarioASerSeguido.seguidores++;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido);

                return res.status(200).json({msg : 'Usuário seguido com sucesso'});
            }

        }

        return res.status(405).json({erro : 'Método não é válido'})

    } catch(e){
        console.log(e);
        return res.status(400).json({erro : 'Não foi possível seguir/deseguir o usuário informado'});
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(seguirEndpoint)));