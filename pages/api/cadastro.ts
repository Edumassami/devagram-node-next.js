import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";
import type { CadastroRequisicao } from "../../types/CadastroRequisicao";
import { UsuarioModel } from "../../models/UsuarioModel";
import {conectarMongoDB} from "../../middlewares/conectaMongoDB";
import md5 from 'md5';
import nc from "next-connect";
import {upload, uploadImagemCosmic} from '../../services/uploadImagemCosmic';

const handler = nc()
.use(upload.single('file'))
.post(async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {

    const usuario = req.body as CadastroRequisicao;

    if (!usuario.nome || usuario.nome.length < 2) {
        return res.status(400).json({ erro: 'Nome inválido' });
    }

    if (!usuario.email || usuario.email.length < 5
        || !usuario.email.includes('@')
        || !usuario.email.includes('.')) {
        return res.status(400).json({ erro: 'E-mail inválido' });
    }

    if (!usuario.senha || usuario.senha.length < 4) {
        return res.status(400).json({ erro: 'Senha inválida' });
    }

        // validacao se ja existe usuario com o mesmo email

        const usuariosComOMesmoEmail = await UsuarioModel.find({email : usuario.email});
        if(usuariosComOMesmoEmail && usuariosComOMesmoEmail.length > 0){
            return res.status(400).json({erro: 'Já existe uma conta com o e-mail informado'});
        }

        //enviar a imagem do multer para o Cosmic
        const image = await uploadImagemCosmic(req);

        // salvar no banco de dados
        const usuarioASerSalvo = {
        nome : usuario.nome,
        email : usuario.email,
        senha : md5(usuario.senha),
        avatar : image?.media?.url
    }


    await UsuarioModel.create(usuarioASerSalvo);
    return res.status(200).json({ msg: 'Cadastro concluído com sucesso' })
    

});

export const config = {
    api : {
        bodyParser : false
    }
};
    
export default conectarMongoDB(handler);
