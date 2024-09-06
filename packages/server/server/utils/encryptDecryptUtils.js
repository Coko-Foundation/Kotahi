const crypto = require('crypto')

// Symmetric encryption key (32 bytes for AES-256)
const encryptionKey = process.env.PUBSWEET_SECRET
const key = crypto.createHash('sha256').update(encryptionKey).digest()

const algorithm = 'aes-256-cbc'

// Function to encrypt text
const encrypt = text => {
  const iv = crypto.randomBytes(16)

  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return `${iv.toString('hex')}:${encrypted}`
}

// Function to decrypt text
const decrypt = text => {
  const [iv, encryptedText] = text.split(':')

  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, 'hex'),
  )

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')

  decrypted += decipher.final('utf8')
  return decrypted
}

module.exports = {
  encrypt,
  decrypt,
}
