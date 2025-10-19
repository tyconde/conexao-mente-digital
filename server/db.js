import sql from "mssql";

const dbConfig = {
  user: "SEU_USUARIO",       // troque pelo seu usuário SQL Server
  password: "SUA_SENHA",     // troque pela sua senha
  server: "localhost",
  database: "ConexaoMente",
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

export async function getConnection() {
  try {
    const pool = await sql.connect(dbConfig);
    return pool;
  } catch (err) {
    console.error("Erro na conexão com o banco:", err);
    throw err;
  }
}

export { sql };
