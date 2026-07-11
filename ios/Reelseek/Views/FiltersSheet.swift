import SwiftUI

struct FiltersSheet: View {
    @Bindable var vm: SearchViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var personQuery: String = ""
    // Shared with DetailView so the chosen country follows the user around.
    @AppStorage("country") private var storedCountry: String = APIConfig.defaultCountry

    var body: some View {
        NavigationStack {
            Form {
                Section("Sort by") {
                    Picker("Sort", selection: $vm.query.sortBy) {
                        ForEach(SortKey.allCases) { k in
                            Text(k.label).tag(k)
                        }
                    }
                    .pickerStyle(.menu)
                }

                Section("Type") {
                    Picker("Media", selection: $vm.query.mediaType) {
                        ForEach(MediaTypeFilter.allCases) { t in
                            Text(t.label).tag(t)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                Section("Provider") {
                    Picker("Provider", selection: providerBinding) {
                        Text("Any").tag("")
                        ForEach(ProviderKey.allCases) { p in
                            Label(p.displayName, systemImage: p.sfSymbol).tag(p.rawValue)
                        }
                    }
                    .pickerStyle(.menu)

                    // Fixed EG/SA/AE list, same as the website (no free text).
                    Picker("Country", selection: $vm.query.country) {
                        ForEach(APIConfig.countries, id: \.code) { c in
                            Text(c.code).tag(c.code)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                Section("Year") {
                    TextField("e.g. 2024", text: $vm.query.year)
                        .keyboardType(.numberPad)
                }

                Section("Minimum rating") {
                    HStack {
                        TextField("0–10", text: $vm.query.voteGte)
                            .keyboardType(.decimalPad)
                        Text("★").foregroundStyle(Theme.accent)
                    }
                }

                Section("Genres") {
                    if vm.genres.isEmpty {
                        Text("Loading genres…").foregroundStyle(Theme.textMuted)
                    } else {
                        let cols = [GridItem(.adaptive(minimum: 110), spacing: 6)]
                        LazyVGrid(columns: cols, spacing: 6) {
                            ForEach(vm.genres) { g in
                                genreChip(g)
                            }
                        }
                    }
                }

                Section("Actor / cast member") {
                    if !vm.selectedPersonName.isEmpty {
                        HStack {
                            Image(systemName: "person.fill")
                            Text(vm.selectedPersonName)
                            Spacer()
                            Button(role: .destructive) {
                                vm.clearPerson()
                            } label: {
                                Image(systemName: "xmark.circle.fill")
                            }
                        }
                    } else {
                        TextField("Search person…", text: $personQuery)
                            .onChange(of: personQuery) { _, new in
                                vm.searchPerson(new)
                            }
                        if !vm.personResults.isEmpty {
                            ForEach(vm.personResults) { p in
                                Button {
                                    vm.selectPerson(p)
                                    personQuery = ""
                                } label: {
                                    HStack {
                                        RemoteImage(urlString: p.profileUrl)
                                            .frame(width: 32, height: 32)
                                            .clipShape(Circle())
                                        VStack(alignment: .leading) {
                                            Text(p.name)
                                                .foregroundStyle(Theme.textPrimary)
                                            if let d = p.knownForDepartment {
                                                Text(d)
                                                    .font(.caption2)
                                                    .foregroundStyle(Theme.textMuted)
                                            }
                                        }
                                        Spacer()
                                    }
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }
            }
            .scrollContentBackground(.hidden)
            .background(Theme.bg)
            .navigationTitle("Filters")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Reset") {
                        vm.reset()
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Search") {
                        storedCountry = vm.query.country
                        vm.runSearch()
                        dismiss()
                    }
                    .bold()
                }
            }
        }
    }

    private var providerBinding: Binding<String> {
        Binding(
            get: { vm.query.provider?.rawValue ?? "" },
            set: { vm.query.provider = ProviderKey(rawValue: $0) }
        )
    }

    private func genreChip(_ g: CombinedGenre) -> some View {
        let selected = vm.query.genreIds.contains(g.id)
        return Button {
            if selected {
                vm.query.genreIds.removeAll { $0 == g.id }
            } else {
                vm.query.genreIds.append(g.id)
            }
        } label: {
            Text(g.name)
                .font(.system(size: 12, weight: selected ? .semibold : .regular))
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .frame(maxWidth: .infinity)
                .background(selected ? Theme.accent.opacity(0.18) : Theme.surface2)
                .foregroundStyle(selected ? Theme.accent : Theme.textPrimary)
                .clipShape(Capsule())
                .overlay(Capsule().stroke(selected ? Theme.accent : Theme.border, lineWidth: 0.5))
        }
        .buttonStyle(.plain)
    }
}
