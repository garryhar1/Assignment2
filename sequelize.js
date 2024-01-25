const { Sequelize, Model, DataTypes } = require("sequelize")
const express = require("express")
const app = express()

app.use(express.json());


class User extends Model { }

async function serve() {
    // define connection and user model
    const sequelize = new Sequelize('postgres://postgres:Penabur_12@127.0.0.1:5432/cinema')
    User.init({
        username: DataTypes.STRING,
        dob: DataTypes.DATE,
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true // Kolom ini bisa bernilai null
        }
    }, { sequelize, modelName: 'user' });

    try {
        // test connection
        await sequelize.authenticate()
        console.log("successful connecting")
    } catch (err) {
        console.log(`error connecting to db ${err}`)
    }
    // POST /api/v1/users
    // Route untuk membuat pengguna baru
    app.post('/users', async (req, res) => {
      const { username, dob } = req.body;
        try {
    // Buat pengguna baru di database
        const newUser = await User.create({
          username: username,
          dob: dob,
        });
      res.status(201).json(newUser); // Mengembalikan pengguna yang baru dibuat
    } catch (error) {
      console.error('Terjadi kesalahan saat membuat pengguna baru:', error);
      res.status(500).json({ error: 'Terjadi kesalahan saat membuat pengguna baru' });
    }
});


    app.get('/users', async(req, res)=>{
        try {
            const users = await User.findAll()
            res.json(users)
        } catch (error) {
            res.status(500).json({error })
        }
    })

    // Route untuk menghapus pengguna berdasarkan ID
  app.delete('/users/:id', async (req, res) => {
    const userId = req.params.id;
    try {
    // Temukan pengguna berdasarkan ID
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    // Set deletedAt untuk menandai pengguna sebagai "dihapus"
    await user.update({ deletedAt: new Date() });

    res.json({ message: 'Pengguna berhasil dihapus secara soft' });
  } catch (error) {
    console.error('Terjadi kesalahan saat menghapus pengguna:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghapus pengguna' });
  }
});


  
  // Route untuk mengupdate pengguna berdasarkan ID
  app.put('/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { username, dob } = req.body;
    try {
      let user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
      }
      user.username = username;
      user.dob = dob;
      await user.save();
      res.json(user);
    } catch (error) {
      console.error('Terjadi kesalahan saat mengupdate pengguna:', error);
      res.status(500).json({ error: 'Terjadi kesalahan saat mengupdate pengguna' });
    }
  });
}

serve()

app.listen(3000,()=>{
    console.log(`listening at http://localhost:${3000}`)
})

module.exports = { serve }