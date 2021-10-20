const mongoose = require('mongoose')
const app = require('../app')
const supertest = require('supertest')
const Blog = require('../models/blog')
const api = supertest(app)

const initialBlogs = [
    {
        title: 'First blog',
        author: 'Jibour',
        url: 'jibour.com',
        likes: 69
    },
    {
        title: 'Second blog',
        author: 'Moufida',
        url: 'moufida.com',
        likes: 420
    }
]
beforeEach(async () => {
    await Blog.deleteMany({})
    for (let blog of initialBlogs) {
        let blogObject = new Blog(blog)
        await blogObject.save()
    }
})

describe('bloggg', () => {
    test('notes are returned in json format', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned ', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(initialBlogs.length)
    })

    test('a valid blog can be added', async () => {
        const newBlog = {
            title: 'new blog',
            author: 'mohsen',
            url: 'mohsen.com',
            likes: 66
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)

        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(initialBlogs.length + 1)

        const newTitles = response.body.map(x => x.title)
        expect(newTitles).toContain('new blog')
    })

    test('adding a blog without likes defaults them to 0', async () => {
        const newBlog = {
            title: 'new blog',
            author: 'mohsen',
            url: 'mohsen.com'
        }

        const createdBlog = await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
        expect(createdBlog.body.likes).toBe(0)


    })

    test('adding a blog without author and url responds with 400 bad req', async () => {
        const newBlog = {
            title: 'new blog'
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400)
        


    }, 100000 )
})


afterAll(() => {
    // Closing the DB connection allows Jest to exit successfully.
    mongoose.connection.close()
})