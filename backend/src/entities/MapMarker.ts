    import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

    @Entity()
    export class MapMarker {
        @PrimaryGeneratedColumn()
        id!: number
        @Column({ default: 0 }) 
        shares_count!: number

        @Column()
        latitude!: number

        @Column()
        longitude!: number

        @Column()
        title!: string

        @Column()
        description!: string

        @Column()
        authorName!: string
    }