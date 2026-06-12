/** Block in page version — max nesting depth 2 (firestore-schema.md §3) */
export interface Section {
    id: string;
    type: string;
    props: Record<string, unknown>;
    children?: Section[];
}
//# sourceMappingURL=section.d.ts.map