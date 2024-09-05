import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { buildRoutePath } from "../utils/build-route-path.js";

const database = new Database()

export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { search } = req.query
            const tasks = database.getTasks('tasks', search ? {
                title: search,
                description: search
            } : null)
            return res.end(JSON.stringify(tasks))
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { title, description } = req.body

            if (title && description) {
                const task = {
                    id: randomUUID(),
                    title,
                    description,
                    completed_at: null,
                    created_at: new Date(),
                    updated_at: new Date()
                }

                database.createTask('tasks', task)
                return res.writeHead(201).end('Created Task')
            } else {
                return res.writeHead(400).end(JSON.stringify({ message: 'Title and description is required' }))
            }
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params
            const { title, description } = req.body

            if (!title && !description) {
                return res.writeHead(400).end(JSON.stringify({ message: 'Title or description is required' }))
            }
            const [task] = database.getTasks('tasks', { id })

            if (!task) {
                return res.writeHead(404).end()
            }

            database.updateTask('tasks', id, {
                title: title ?? task.title,
                description: description ?? task.description,
                updated_at: new Date()
            })
            return res.writeHead(204).end(`Updated task: ${id}`)
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            const { id } = req.params
            const [task] = database.getTasks('tasks', { id })

            if (!task) {
                return res.writeHead(404).end()
            }
            const isCompletedTask = !!task.completed_at
            const completed_at = isCompletedTask ? null : new Date()

            database.updateTask('tasks', id, {
                completed_at,
                updated_at: new Date()
            }
            )
            return res.writeHead(204).end()
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params
            const [task] = database.getTasks('tasks', { id })

            if (!task) {
                return res.writeHead(404).end()
            }

            database.deleteTask('tasks', id)
            return res.writeHead(200).end(JSON.stringify({ message: `Deleted task: ${id}` }))
        }
    }
]