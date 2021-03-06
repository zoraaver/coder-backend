# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_02_07_151946) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "courses", force: :cascade do |t|
    t.string "title"
    t.string "description"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "img_url"
  end

  create_table "lessons", force: :cascade do |t|
    t.string "title"
    t.integer "subsection_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.text "test"
    t.text "starter_code"
    t.string "language"
    t.text "content"
    t.integer "sort_id", default: 0
    t.index ["sort_id"], name: "index_lessons_on_sort_id"
  end

  create_table "sections", force: :cascade do |t|
    t.string "title"
    t.integer "course_id"
    t.integer "sort_id", default: 0
    t.index ["sort_id"], name: "index_sections_on_sort_id"
  end

  create_table "subsections", force: :cascade do |t|
    t.string "title"
    t.integer "section_id"
    t.integer "sort_id", default: 0
    t.index ["sort_id"], name: "index_subsections_on_sort_id"
  end

  create_table "user_courses", force: :cascade do |t|
    t.integer "user_id"
    t.integer "course_id"
  end

  create_table "user_lessons", force: :cascade do |t|
    t.integer "lesson_id"
    t.integer "user_id"
    t.integer "status", default: 1
    t.text "code"
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "password_digest"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.boolean "admin", default: false
  end

end
