const { createApp } = Vue

const Topic = {
    props: ['topic'],
    data() {
        return {
            comments: this.topic.comments,
            formComment: {
                comment: '',
                date: new Date().toISOString(),
                by: ''
            }
        }
    },
    methods: {
        addComment() {
            this.comments.unshift(this.formComment)
            this.formComment = {
                comment: '',
                date: new Date().toISOString(),
                by: ''
            }
        },
        deleteComment(index) {
            this.comments = this.comments.filter((c, i) => {
                return i !== index
            })
        },
        deleteTopic() {
            this.$emit('delete', this.topic)
        },
        editTopic() {
            this.$emit('edit', this.topic)
        }
    },
    template: `
        <div class="topic">
            <div>
                <p class="title">
                    <span>Topic: </span>
                    {{ topic.name }}
                </p>

                <div class="topic-action-wrapper">
                    <div class="topic-action-button">
                        <button @click="editTopic">Edit Topic</button>
                        <button @click="deleteTopic">Delete Topic</button>
                    </div>
                </div>
            </div>
            
            <hr>

            <div class="comments">
                <span v-if="comments.length > 1">{{comments.length}} Comments</span>
                <span v-else>{{comments.length}} Comment</span>

                <Comment 
                    v-for="(comment, index) in comments" 
                    :key="index" 
                    :comment="comment"
                    @delete="deleteComment(index)"
                 />

                <hr>

                <div class="comments-footer">
                    <form class="comments-form" @submit.prevent="addComment">
                        <div class="form-group">
                            <label>Name: </label>
                            <input v-model="formComment.by" type="text" class="comment-input" />
                        </div>

                        <div class="form-group">
                            <label>Comment: </label>
                            <textarea class="comment-textarea" v-model="formComment.comment"></textarea>
                        </div>
                        
                        <button class="button-add-comment" type="submit">Add Comment</button>
                    </form>
                </div>
            </div>
        </div>
    `
}

const Comment = {
    props: ['comment'],
    data() {
        return {
            isActive: false,
            textComment: this.comment.comment
        }
    },
    methods: {
        editComment() {
            this.isActive = true
        },
        saveComment() {
            this.isActive = false
        },
        deleteComment() {
            this.$emit("delete", this.comment)
        }
    },
    template: `
        <div class="comment">
            <div class="comment-header">
                <span>By: {{comment.by}}</span>
                <span>Date: {{comment.date}}</span>
            </div>

            <div class="comment-body" style="width: 100%">
                <div class="form-group">
                    <textarea v-show="isActive" v-model="comment.comment" class="comment-textarea" style="border: 1px solid gray"></textarea>
                </div>
                <span v-show="!isActive">{{comment.comment}}</span>
            </div>

            <div class="comment-footer">
                <button v-if="isActive" @click="saveComment">Save</button>
                <button v-else @click="editComment">Edit Comment</button>
                <button @click="deleteComment">Delete Comment</button>
            </div>
        </div>
    `
}

const Modal = {
    props: ['type'],
    methods: {
        closeModal() {
            this.$emit('close')
        }
    },
    template: `
        <div class="modal">
            <div class="modal-container">
                <div class="modal-header">
                    <slot name="header" />

                    <button class="modal-close-btn" @click="closeModal">X</button>
                </div>

                <hr>

                <div class="modal-body">
                    <slot name="body" />
                </div>
            </div>
        </div>
    `
}

const app = createApp({
    data() {
        return {
            topics: [],
            openModal: false,
            isEditing: false,
            isCreating: false,
            formTopic: {
                name: '',
                guid: '',
                comments: []
            }
        }
    },
    computed: {
        createUUID() {
            // https://www.w3resource.com/javascript-exercises/javascript-math-exercise-23.php
            let dt = new Date().getTime()
            let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                let r = (dt + Math.random()*16)%16 | 0
                dt = Math.floor(dt/16)
                return (c=='x' ? r :(r&0x3|0x8)).toString(16)
            })
            return uuid      
        }
    },
    methods: {
        displayModal(type) {
            this.openModal = true

            if(type === 'edit') {
                this.isEditing = true
                this.isCreating = false
            } else if(type === 'add') {
                this.isEditing = false
                this.isCreating = true
            }
        },
        createTopic() {
            this.topics.unshift({
                name: this.formTopic.name,
                guid: this.createUUID,
                comments: []
            })

            this.formTopic = {}
            this.openModal = false
        },
        deleteTopic(topic) {
            this.topics = this.topics.filter(t => {
                return t.guid !== topic.guid
            })
        },
        editTopic(topic) {
            this.isEditing = true
            this.formTopic = topic
            this.openModal = true
        },
        closeModal() {
            this.openModal = false
            this.formTopic = {
                name: '',
                guid: '',
                comments: []
            }
            this.isEditing = false
            this.isCreating = false
        }
    },
    created() {
        this.topics = getTopics()
    }   
})

app.component('Topic', Topic)
app.component('Comment', Comment)
app.component('Modal', Modal)
app.mount('#app')